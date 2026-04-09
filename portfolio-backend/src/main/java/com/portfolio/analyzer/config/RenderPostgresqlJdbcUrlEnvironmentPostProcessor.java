package com.portfolio.analyzer.config;

import java.net.URI;
import java.util.Map;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

/**
 * Render injects {@code SPRING_DATASOURCE_URL} as {@code postgresql://user:pass@host:port/db}.
 * Spring Boot expects {@code jdbc:postgresql://host:port/db} with credentials via separate properties.
 */
public class RenderPostgresqlJdbcUrlEnvironmentPostProcessor implements EnvironmentPostProcessor {

    private static final String SOURCE_NAME = "renderPostgresqlJdbcUrl";

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        String raw = environment.getProperty("spring.datasource.url");
        if (raw == null || !raw.startsWith("postgresql://")) {
            return;
        }
        try {
            URI uri = new URI(raw);
            String host = uri.getHost();
            if (host == null) {
                throw new IllegalArgumentException("missing host");
            }
            int port = uri.getPort();
            if (port < 0) {
                port = 5432;
            }
            String path = uri.getPath();
            if (path == null || path.length() <= 1) {
                throw new IllegalArgumentException("missing database name in path");
            }
            String database = path.substring(1);
            String jdbc = "jdbc:postgresql://" + host + ":" + port + "/" + database;
            environment
                    .getPropertySources()
                    .addFirst(new MapPropertySource(SOURCE_NAME, Map.of("spring.datasource.url", jdbc)));
        } catch (Exception e) {
            throw new IllegalStateException(
                    "Could not convert Render PostgreSQL URL to JDBC (spring.datasource.url)", e);
        }
    }
}
