package com.portfolio.analyzer.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "holdings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Holding {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank
    @Column(nullable = false, length = 10)
    private String ticker;
    
    @Column(length = 200)
    private String companyName;
    
    @NotBlank
    @Column(nullable = false, length = 100)
    private String sector;
    
    @Positive
    @Column(nullable = false)
    private Integer shares;
    
    @Column(precision = 10, scale = 2)
    private BigDecimal purchasePrice;
    
    @Column(precision = 10, scale = 2)
    private BigDecimal currentPrice;
    
    @Column(precision = 10, scale = 2)
    private BigDecimal value;
    
    @Column(precision = 5, scale = 2)
    private BigDecimal weight; // Percentage
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "portfolio_id", nullable = false)
    private Portfolio portfolio;
}
