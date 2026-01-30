package com.portfolio.analyzer.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class HoldingResponse {
    private Long id;
    private String ticker;
    private String companyName;
    private String sector;
    private Integer shares;
    private BigDecimal currentPrice;
    private BigDecimal value;
    private BigDecimal weight;
}
