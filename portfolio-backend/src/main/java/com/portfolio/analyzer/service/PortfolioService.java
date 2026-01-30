package com.portfolio.analyzer.service;

import com.portfolio.analyzer.dto.*;
import com.portfolio.analyzer.exception.ResourceNotFoundException;
import com.portfolio.analyzer.model.Holding;
import com.portfolio.analyzer.model.Portfolio;
import com.portfolio.analyzer.model.User;
import com.portfolio.analyzer.repository.HoldingRepository;
import com.portfolio.analyzer.repository.PortfolioRepository;
import com.portfolio.analyzer.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PortfolioService {
    
    private final PortfolioRepository portfolioRepository;
    private final HoldingRepository holdingRepository;
    private final UserRepository userRepository;
    
    @Transactional
    public PortfolioResponse createPortfolio(Long userId, CreatePortfolioRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        Portfolio portfolio = new Portfolio();
        portfolio.setName(request.getName());
        portfolio.setUser(user);
        
        // Calculate total value
        BigDecimal totalValue = BigDecimal.ZERO;
        for (HoldingRequest holdingReq : request.getHoldings()) {
            BigDecimal holdingValue = holdingReq.getCurrentPrice()
                    .multiply(BigDecimal.valueOf(holdingReq.getShares()));
            totalValue = totalValue.add(holdingValue);
        }
        portfolio.setTotalValue(totalValue);
        
        // Save portfolio first to get ID
        portfolio = portfolioRepository.save(portfolio);
        
        // Create holdings
        for (HoldingRequest holdingReq : request.getHoldings()) {
            Holding holding = new Holding();
            holding.setTicker(holdingReq.getTicker());
            holding.setCompanyName(holdingReq.getCompanyName());
            holding.setSector(holdingReq.getSector());
            holding.setShares(holdingReq.getShares());
            holding.setCurrentPrice(holdingReq.getCurrentPrice());
            
            BigDecimal value = holdingReq.getCurrentPrice()
                    .multiply(BigDecimal.valueOf(holdingReq.getShares()));
            holding.setValue(value);
            
            BigDecimal weight = value.divide(totalValue, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
            holding.setWeight(weight);
            
            holding.setPortfolio(portfolio);
            portfolio.getHoldings().add(holding);
        }
        
        // Calculate risk metrics
        calculateRiskMetrics(portfolio);
        
        portfolio = portfolioRepository.save(portfolio);
        
        return mapToResponse(portfolio);
    }
    
    @Transactional
    public PortfolioResponse updatePortfolio(Long userId, Long portfolioId, CreatePortfolioRequest request) {
        Portfolio portfolio = portfolioRepository.findByIdAndUserId(portfolioId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Portfolio not found"));
        
        // Update name
        portfolio.setName(request.getName());
        
        // Remove old holdings
        portfolio.getHoldings().clear();
        
        // Calculate total value
        BigDecimal totalValue = BigDecimal.ZERO;
        for (HoldingRequest holdingReq : request.getHoldings()) {
            BigDecimal holdingValue = holdingReq.getCurrentPrice()
                    .multiply(BigDecimal.valueOf(holdingReq.getShares()));
            totalValue = totalValue.add(holdingValue);
        }
        portfolio.setTotalValue(totalValue);
        
        // Create new holdings
        for (HoldingRequest holdingReq : request.getHoldings()) {
            Holding holding = new Holding();
            holding.setTicker(holdingReq.getTicker());
            holding.setCompanyName(holdingReq.getCompanyName());
            holding.setSector(holdingReq.getSector());
            holding.setShares(holdingReq.getShares());
            holding.setCurrentPrice(holdingReq.getCurrentPrice());
            
            BigDecimal value = holdingReq.getCurrentPrice()
                    .multiply(BigDecimal.valueOf(holdingReq.getShares()));
            holding.setValue(value);
            
            BigDecimal weight = value.divide(totalValue, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
            holding.setWeight(weight);
            
            holding.setPortfolio(portfolio);
            portfolio.getHoldings().add(holding);
        }
        
        // Recalculate risk metrics
        calculateRiskMetrics(portfolio);
        
        portfolio = portfolioRepository.save(portfolio);
        
        return mapToResponse(portfolio);
    }
    
    @Transactional(readOnly = true)
    public List<PortfolioResponse> getUserPortfolios(Long userId) {
        List<Portfolio> portfolios = portfolioRepository.findByUserId(userId);
        return portfolios.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public PortfolioResponse getPortfolioById(Long userId, Long portfolioId) {
        Portfolio portfolio = portfolioRepository.findByIdAndUserId(portfolioId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Portfolio not found"));
        return mapToResponse(portfolio);
    }
    
    @Transactional
    public void deletePortfolio(Long userId, Long portfolioId) {
        Portfolio portfolio = portfolioRepository.findByIdAndUserId(portfolioId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Portfolio not found"));
        portfolioRepository.delete(portfolio);
    }
    
    private void calculateRiskMetrics(Portfolio portfolio) {
        Map<String, BigDecimal> sectorConcentration = new HashMap<>();
        
        for (Holding holding : portfolio.getHoldings()) {
            sectorConcentration.merge(
                    holding.getSector(),
                    holding.getWeight(),
                    BigDecimal::add
            );
        }
        
        // Find max concentration
        BigDecimal maxConcentration = sectorConcentration.values().stream()
                .max(BigDecimal::compareTo)
                .orElse(BigDecimal.ZERO);
        
        // Calculate diversification score (inverse of max concentration)
        BigDecimal diversificationScore = BigDecimal.valueOf(100)
                .subtract(maxConcentration)
                .setScale(2, RoundingMode.HALF_UP);
        
        portfolio.setDiversificationScore(diversificationScore);
        
        // Determine risk level
        if (maxConcentration.compareTo(BigDecimal.valueOf(70)) >= 0) {
            portfolio.setRiskLevel("HIGH");
        } else if (maxConcentration.compareTo(BigDecimal.valueOf(50)) >= 0) {
            portfolio.setRiskLevel("MEDIUM");
        } else {
            portfolio.setRiskLevel("LOW");
        }
    }
    
    private PortfolioResponse mapToResponse(Portfolio portfolio) {
        PortfolioResponse response = new PortfolioResponse();
        response.setId(portfolio.getId());
        response.setName(portfolio.getName());
        response.setTotalValue(portfolio.getTotalValue());
        response.setDiversificationScore(portfolio.getDiversificationScore());
        response.setRiskLevel(portfolio.getRiskLevel());
        response.setCreatedAt(portfolio.getCreatedAt());
        response.setUpdatedAt(portfolio.getUpdatedAt());
        
        List<HoldingResponse> holdings = portfolio.getHoldings().stream()
                .map(this::mapHoldingToResponse)
                .collect(Collectors.toList());
        response.setHoldings(holdings);
        
        return response;
    }
    
    private HoldingResponse mapHoldingToResponse(Holding holding) {
        HoldingResponse response = new HoldingResponse();
        response.setId(holding.getId());
        response.setTicker(holding.getTicker());
        response.setCompanyName(holding.getCompanyName());
        response.setSector(holding.getSector());
        response.setShares(holding.getShares());
        response.setCurrentPrice(holding.getCurrentPrice());
        response.setValue(holding.getValue());
        response.setWeight(holding.getWeight());
        return response;
    }
}
