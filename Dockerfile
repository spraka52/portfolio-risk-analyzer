# Build stage
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY portfolio-backend/pom.xml .
RUN mvn dependency:go-offline -q
COPY portfolio-backend/src ./src
RUN mvn clean package -DskipTests -q

# Run stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/portfolio-analyzer-1.0.0.jar app.jar
EXPOSE 10000
ENTRYPOINT ["java", "-Dserver.port=${PORT:-10000}", "-Dspring.profiles.active=prod", "-jar", "app.jar"]
