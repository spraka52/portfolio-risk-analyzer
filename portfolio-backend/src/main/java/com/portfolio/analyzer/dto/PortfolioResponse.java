package com.portfolio.analyzer.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class PortfolioResponse {
    private Long id;
    private String name;
    private List<HoldingResponse> holdings;
    private BigDecimal totalValue;
    private BigDecimal diversificationScore;
    private String riskLevel;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
