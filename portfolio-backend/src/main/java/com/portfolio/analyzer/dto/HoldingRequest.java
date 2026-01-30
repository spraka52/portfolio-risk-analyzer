package com.portfolio.analyzer.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class HoldingRequest {
    @NotBlank
    private String ticker;
    
    private String companyName;
    
    @NotBlank
    private String sector;
    
    @Positive
    private Integer shares;
    
    private BigDecimal currentPrice;
}
