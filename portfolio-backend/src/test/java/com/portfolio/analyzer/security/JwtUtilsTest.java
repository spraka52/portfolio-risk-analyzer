package com.portfolio.analyzer.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Collections;

import static org.assertj.core.api.Assertions.assertThat;

class JwtUtilsTest {

    private JwtUtils jwtUtils;

    // 64-char secret satisfies the HS512 minimum key size
    private static final String SECRET =
            "test-secret-key-which-is-at-least-64-characters-long-for-hs512!!";

    @BeforeEach
    void setUp() {
        jwtUtils = new JwtUtils();
        ReflectionTestUtils.setField(jwtUtils, "jwtSecret", SECRET);
        ReflectionTestUtils.setField(jwtUtils, "jwtExpirationMs", 3_600_000); // 1 hour
    }

    @Test
    void generatedToken_isValid() {
        String token = jwtUtils.generateJwtToken(authFor("alice@example.com"));
        assertThat(jwtUtils.validateJwtToken(token)).isTrue();
    }

    @Test
    void emailRoundtrip_matchesInput() {
        String email = "bob@example.com";
        String token = jwtUtils.generateJwtToken(authFor(email));
        assertThat(jwtUtils.getEmailFromJwtToken(token)).isEqualTo(email);
    }

    @Test
    void tamperedToken_failsValidation() {
        String token = jwtUtils.generateJwtToken(authFor("carol@example.com"));
        String tampered = token.substring(0, token.length() - 4) + "XXXX";
        assertThat(jwtUtils.validateJwtToken(tampered)).isFalse();
    }

    @Test
    void malformedToken_failsValidation() {
        assertThat(jwtUtils.validateJwtToken("not.a.jwt")).isFalse();
    }

    @Test
    void emptyToken_failsValidation() {
        assertThat(jwtUtils.validateJwtToken("")).isFalse();
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private Authentication authFor(String email) {
        UserDetailsImpl principal = new UserDetailsImpl(1L, "Test User", email, "hashed");
        return new UsernamePasswordAuthenticationToken(principal, null, Collections.emptyList());
    }
}
