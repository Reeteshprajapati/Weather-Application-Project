# Stage 1: Build the Spring Boot application using Maven and Java 21
FROM maven:3.9.6-eclipse-temurin-21-alpine AS build
WORKDIR /app

# Copy weather-backend pom.xml and download dependencies
COPY weather-backend/pom.xml ./pom.xml
RUN mvn dependency:go-offline -B

# Copy backend source code and build jar
COPY weather-backend/src ./src
RUN mvn clean package -DskipTests

# Stage 2: Minimal Java 21 runtime
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copy the built jar from build stage
COPY --from=build /app/target/weather-backend-1.0.0.jar app.jar

# Expose default port
EXPOSE 8080

# Environment variables
ENV PORT=8080

# Start Spring Boot application
ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
