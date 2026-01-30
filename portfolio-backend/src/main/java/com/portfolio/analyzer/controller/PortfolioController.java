package com.portfolio.analyzer.controller;

import com.portfolio.analyzer.dto.CreatePortfolioRequest;
import com.portfolio.analyzer.dto.PortfolioResponse;
import com.portfolio.analyzer.security.UserDetailsImpl;
import com.portfolio.analyzer.service.PortfolioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/portfolios")
@RequiredArgsConstructor
public class PortfolioController {
    
    private final PortfolioService portfolioService;
    
    @PostMapping
    public ResponseEntity<PortfolioResponse> createPortfolio(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody CreatePortfolioRequest request) {
        PortfolioResponse response = portfolioService.createPortfolio(userDetails.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    @GetMapping
    public ResponseEntity<List<PortfolioResponse>> getUserPortfolios(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        List<PortfolioResponse> portfolios = portfolioService.getUserPortfolios(userDetails.getId());
        return ResponseEntity.ok(portfolios);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<PortfolioResponse> getPortfolio(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long id) {
        PortfolioResponse portfolio = portfolioService.getPortfolioById(userDetails.getId(), id);
        return ResponseEntity.ok(portfolio);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<PortfolioResponse> updatePortfolio(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long id,
            @Valid @RequestBody CreatePortfolioRequest request) {
        PortfolioResponse response = portfolioService.updatePortfolio(userDetails.getId(), id, request);
        return ResponseEntity.ok(response);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePortfolio(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long id) {
        portfolioService.deletePortfolio(userDetails.getId(), id);
        return ResponseEntity.noContent().build();
    }
}
