package com.portfolio.analyzer.controller;

import com.portfolio.analyzer.service.FinnhubService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stocks")
@RequiredArgsConstructor
public class StockController {
    
    private final FinnhubService finnhubService;
    
    @GetMapping("/quote/{ticker}")
    public ResponseEntity<FinnhubService.StockData> getStockQuote(@PathVariable String ticker) {
        FinnhubService.StockData stockData = finnhubService.getStockData(ticker);
        return ResponseEntity.ok(stockData);
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<FinnhubService.StockSearchResult>> searchStocks(
            @RequestParam String q) {
        List<FinnhubService.StockSearchResult> results = finnhubService.searchStocks(q);
        return ResponseEntity.ok(results);
    }
}
