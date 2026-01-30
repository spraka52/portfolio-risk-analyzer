package com.portfolio.analyzer.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FinnhubService {
    
    @Value("${finnhub.api.key}")
    private String apiKey;
    
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    public StockData getStockData(String ticker) {
        try {
            // Get quote (price)
            String quoteUrl = String.format("https://finnhub.io/api/v1/quote?symbol=%s&token=%s", 
                    ticker, apiKey);
            String quoteResponse = restTemplate.getForObject(quoteUrl, String.class);
            JsonNode quoteNode = objectMapper.readTree(quoteResponse);
            
            double currentPrice = quoteNode.get("c").asDouble();
            
            if (currentPrice == 0) {
                throw new RuntimeException("Stock not found");
            }
            
            // Get profile (name, sector)
            String profileUrl = String.format("https://finnhub.io/api/v1/stock/profile2?symbol=%s&token=%s", 
                    ticker, apiKey);
            String profileResponse = restTemplate.getForObject(profileUrl, String.class);
            JsonNode profileNode = objectMapper.readTree(profileResponse);
            
            String name = profileNode.has("name") ? profileNode.get("name").asText() : ticker;
            String sector = profileNode.has("finnhubIndustry") ? 
                    profileNode.get("finnhubIndustry").asText() : "Technology";
            
            return new StockData(
                    ticker.toUpperCase(),
                    name,
                    BigDecimal.valueOf(currentPrice),
                    sector
            );
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch stock data: " + e.getMessage());
        }
    }
    
    public List<StockSearchResult> searchStocks(String query) {
        try {
            String searchUrl = String.format("https://finnhub.io/api/v1/search?q=%s&token=%s", 
                    query, apiKey);
            String response = restTemplate.getForObject(searchUrl, String.class);
            JsonNode rootNode = objectMapper.readTree(response);
            
            List<StockSearchResult> results = new ArrayList<>();
            JsonNode resultArray = rootNode.get("result");
            
            if (resultArray != null && resultArray.isArray()) {
                int count = 0;
                for (JsonNode node : resultArray) {
                    if (count >= 5) break;
                    
                    String type = node.has("type") ? node.get("type").asText() : "";
                    if ("Common Stock".equals(type)) {
                        String symbol = node.get("symbol").asText();
                        // Skip symbols with dots (foreign exchanges)
                        if (!symbol.contains(".")) {
                            results.add(new StockSearchResult(
                                    symbol,
                                    node.get("description").asText(),
                                    node.has("displaySymbol") ? node.get("displaySymbol").asText() : symbol
                            ));
                            count++;
                        }
                    }
                }
            }
            
            return results;
        } catch (Exception e) {
            throw new RuntimeException("Failed to search stocks: " + e.getMessage());
        }
    }
    
    // Inner classes for response data
    public static class StockData {
        public String ticker;
        public String name;
        public BigDecimal price;
        public String sector;
        
        public StockData(String ticker, String name, BigDecimal price, String sector) {
            this.ticker = ticker;
            this.name = name;
            this.price = price;
            this.sector = sector;
        }
    }
    
    public static class StockSearchResult {
        public String ticker;
        public String name;
        public String exchange;
        
        public StockSearchResult(String ticker, String name, String exchange) {
            this.ticker = ticker;
            this.name = name;
            this.exchange = exchange;
        }
    }
}
