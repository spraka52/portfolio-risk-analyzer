package com.portfolio.analyzer.service;

import com.portfolio.analyzer.dto.CreatePortfolioRequest;
import com.portfolio.analyzer.dto.HoldingRequest;
import com.portfolio.analyzer.dto.PortfolioResponse;
import com.portfolio.analyzer.model.Portfolio;
import com.portfolio.analyzer.model.User;
import com.portfolio.analyzer.repository.HoldingRepository;
import com.portfolio.analyzer.repository.PortfolioRepository;
import com.portfolio.analyzer.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PortfolioServiceTest {

    @Mock private PortfolioRepository portfolioRepository;
    @Mock private HoldingRepository holdingRepository;
    @Mock private UserRepository userRepository;

    @InjectMocks private PortfolioService portfolioService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setName("Test User");
        testUser.setEmail("test@example.com");
    }

    // ── Risk level classification ──────────────────────────────────────────────

    @Test
    void riskLevel_isHigh_whenSingleSectorExceeds70Percent() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(portfolioRepository.save(any(Portfolio.class))).thenAnswer(inv -> inv.getArgument(0));

        PortfolioResponse response = portfolioService.createPortfolio(1L, allTechPortfolio());

        assertThat(response.getRiskLevel()).isEqualTo("HIGH");
    }

    @Test
    void riskLevel_isMedium_whenTopSectorBetween50And70Percent() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(portfolioRepository.save(any(Portfolio.class))).thenAnswer(inv -> inv.getArgument(0));

        PortfolioResponse response = portfolioService.createPortfolio(1L, mediumConcentrationPortfolio());

        assertThat(response.getRiskLevel()).isEqualTo("MEDIUM");
    }

    @Test
    void riskLevel_isLow_whenWellDiversified() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(portfolioRepository.save(any(Portfolio.class))).thenAnswer(inv -> inv.getArgument(0));

        PortfolioResponse response = portfolioService.createPortfolio(1L, diversifiedPortfolio());

        assertThat(response.getRiskLevel()).isEqualTo("LOW");
    }

    // ── Diversification score ──────────────────────────────────────────────────

    @Test
    void diversificationScore_isLow_forConcentratedPortfolio() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(portfolioRepository.save(any(Portfolio.class))).thenAnswer(inv -> inv.getArgument(0));

        PortfolioResponse response = portfolioService.createPortfolio(1L, allTechPortfolio());

        // Score = 100 - maxSectorWeight; with 100% tech, score ≈ 0
        assertThat(response.getDiversificationScore()).isLessThan(BigDecimal.valueOf(10));
    }

    @Test
    void diversificationScore_isHigh_forDiversifiedPortfolio() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(portfolioRepository.save(any(Portfolio.class))).thenAnswer(inv -> inv.getArgument(0));

        PortfolioResponse response = portfolioService.createPortfolio(1L, diversifiedPortfolio());

        assertThat(response.getDiversificationScore()).isGreaterThan(BigDecimal.valueOf(70));
    }

    // ── Holding weights ────────────────────────────────────────────────────────

    @Test
    void holdingWeights_sumTo100() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(portfolioRepository.save(any(Portfolio.class))).thenAnswer(inv -> inv.getArgument(0));

        PortfolioResponse response = portfolioService.createPortfolio(1L, diversifiedPortfolio());

        BigDecimal totalWeight = response.getHoldings().stream()
                .map(h -> h.getWeight())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        assertThat(totalWeight).isCloseTo(BigDecimal.valueOf(100), org.assertj.core.data.Offset.offset(BigDecimal.valueOf(0.1)));
    }

    @Test
    void holdingValue_isCalculatedFromSharesTimesPrice() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(portfolioRepository.save(any(Portfolio.class))).thenAnswer(inv -> inv.getArgument(0));

        CreatePortfolioRequest request = new CreatePortfolioRequest();
        request.setName("Single Stock");
        HoldingRequest h = holding("AAPL", "Technology", 10, "150.00");
        request.setHoldings(List.of(h));

        PortfolioResponse response = portfolioService.createPortfolio(1L, request);

        assertThat(response.getTotalValue()).isEqualByComparingTo(new BigDecimal("1500.00"));
    }

    // ── Error handling ─────────────────────────────────────────────────────────

    @Test
    void createPortfolio_throwsWhenUserNotFound() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> portfolioService.createPortfolio(99L, diversifiedPortfolio()))
                .hasMessageContaining("User not found");
    }

    // ── Factory helpers ────────────────────────────────────────────────────────

    /** 100% Technology — should be HIGH risk */
    private CreatePortfolioRequest allTechPortfolio() {
        CreatePortfolioRequest req = new CreatePortfolioRequest();
        req.setName("All Tech");
        req.setHoldings(List.of(
                holding("AAPL", "Technology", 10, "150.00"),
                holding("MSFT", "Technology", 5, "300.00"),
                holding("GOOGL", "Technology", 2, "2800.00")
        ));
        return req;
    }

    /** ~60% Technology, rest mixed — should be MEDIUM risk */
    private CreatePortfolioRequest mediumConcentrationPortfolio() {
        CreatePortfolioRequest req = new CreatePortfolioRequest();
        req.setName("Medium Risk");
        req.setHoldings(List.of(
                holding("AAPL", "Technology", 10, "150.00"),   // $1,500
                holding("MSFT", "Technology", 5,  "150.00"),   // $750  → tech $2,250 / total $4,000 ≈ 56%
                holding("JPM",  "Finance",    10, "100.00"),   // $1,000
                holding("JNJ",  "Healthcare", 5,  "150.00")    // $750
        ));
        return req;
    }

    /** 4 sectors roughly equal — should be LOW risk */
    private CreatePortfolioRequest diversifiedPortfolio() {
        CreatePortfolioRequest req = new CreatePortfolioRequest();
        req.setName("Diversified");
        req.setHoldings(List.of(
                holding("AAPL", "Technology", 5,  "100.00"),  // $500
                holding("JPM",  "Finance",    5,  "100.00"),  // $500
                holding("JNJ",  "Healthcare", 5,  "100.00"),  // $500
                holding("XOM",  "Energy",     5,  "100.00")   // $500  → each 25%
        ));
        return req;
    }

    private HoldingRequest holding(String ticker, String sector, int shares, String price) {
        HoldingRequest h = new HoldingRequest();
        h.setTicker(ticker);
        h.setCompanyName(ticker + " Inc.");
        h.setSector(sector);
        h.setShares(shares);
        h.setCurrentPrice(new BigDecimal(price));
        return h;
    }
}
