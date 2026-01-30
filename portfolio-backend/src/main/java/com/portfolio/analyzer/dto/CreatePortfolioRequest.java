package com.portfolio.analyzer.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class CreatePortfolioRequest {
    @NotBlank
    private String name;
    
    @NotEmpty
    @Valid
    private List<HoldingRequest> holdings;
}
