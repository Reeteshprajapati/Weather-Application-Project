package com.weatherapp.service;

import com.weatherapp.dto.WeatherRecommendationDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class WeatherRecommendationServiceTest {

    private WeatherRecommendationService recommendationService;

    @BeforeEach
    void setUp() {
        recommendationService = new WeatherRecommendationService();
    }

    @Test
    void testHighPrecipitation_TriggersUmbrellaWarning() {
        List<WeatherRecommendationDto> recs = recommendationService.generateRecommendations(
                75.0,  // precipitationProb
                2.0,   // uvIndex
                10.0,  // windSpeed
                20.0,  // temperature
                0      // weatherCode (clear)
        );

        WeatherRecommendationDto umbrellaRec = recs.stream()
                .filter(r -> "UMBRELLA".equals(r.getCategory()))
                .findFirst()
                .orElse(null);

        assertNotNull(umbrellaRec);
        assertEquals("Carry an Umbrella", umbrellaRec.getTitle());
        assertEquals("WARNING", umbrellaRec.getLevel());
        assertEquals("umbrella", umbrellaRec.getIconType());
    }

    @Test
    void testModeratePrecipitation_TriggersUmbrellaNotice() {
        List<WeatherRecommendationDto> recs = recommendationService.generateRecommendations(
                35.0, // precipitationProb (between 30% and 50%)
                2.0,
                10.0,
                20.0,
                0
        );

        WeatherRecommendationDto umbrellaRec = recs.stream()
                .filter(r -> "UMBRELLA".equals(r.getCategory()))
                .findFirst()
                .orElse(null);

        assertNotNull(umbrellaRec);
        assertEquals("Umbrella Recommended", umbrellaRec.getTitle());
        assertEquals("NOTICE", umbrellaRec.getLevel());
    }

    @Test
    void testDryWeather_NoUmbrellaRecommendation() {
        List<WeatherRecommendationDto> recs = recommendationService.generateRecommendations(
                10.0, // precipitationProb < 30%
                2.0,
                10.0,
                20.0,
                0     // Clear sky
        );

        boolean hasUmbrella = recs.stream().anyMatch(r -> "UMBRELLA".equals(r.getCategory()));
        assertFalse(hasUmbrella);
    }

    @Test
    void testHighUvIndex_TriggersSunProtectionWarning() {
        List<WeatherRecommendationDto> recs = recommendationService.generateRecommendations(
                0.0,
                8.0,  // UV Index >= 6.0
                10.0,
                25.0,
                0
        );

        WeatherRecommendationDto uvRec = recs.stream()
                .filter(r -> "SUN_PROTECTION".equals(r.getCategory()))
                .findFirst()
                .orElse(null);

        assertNotNull(uvRec);
        assertEquals("Sun Protection Required", uvRec.getTitle());
        assertEquals("WARNING", uvRec.getLevel());
        assertEquals("sun", uvRec.getIconType());
    }

    @Test
    void testModerateUvIndex_TriggersSunProtectionInfo() {
        List<WeatherRecommendationDto> recs = recommendationService.generateRecommendations(
                0.0,
                4.5,  // UV Index between 3.0 and 6.0
                10.0,
                25.0,
                0
        );

        WeatherRecommendationDto uvRec = recs.stream()
                .filter(r -> "SUN_PROTECTION".equals(r.getCategory()))
                .findFirst()
                .orElse(null);

        assertNotNull(uvRec);
        assertEquals("Moderate Sun Exposure", uvRec.getTitle());
        assertEquals("INFO", uvRec.getLevel());
    }

    @Test
    void testLowOrMissingUvIndex_OmittedGracefully() {
        // Low UV (< 3.0)
        List<WeatherRecommendationDto> lowUv = recommendationService.generateRecommendations(
                0.0, 1.5, 10.0, 20.0, 0
        );
        assertFalse(lowUv.stream().anyMatch(r -> "SUN_PROTECTION".equals(r.getCategory())));

        // Null UV
        List<WeatherRecommendationDto> nullUv = recommendationService.generateRecommendations(
                0.0, null, 10.0, 20.0, 0
        );
        assertFalse(nullUv.stream().anyMatch(r -> "SUN_PROTECTION".equals(r.getCategory())));
    }

    @Test
    void testHighWindSpeed_TriggersWindAlert() {
        List<WeatherRecommendationDto> recs = recommendationService.generateRecommendations(
                0.0,
                2.0,
                38.5, // Wind speed >= 30 km/h
                20.0,
                0
        );

        WeatherRecommendationDto windRec = recs.stream()
                .filter(r -> "WIND_ALERT".equals(r.getCategory()))
                .findFirst()
                .orElse(null);

        assertNotNull(windRec);
        assertEquals("High Wind Alert", windRec.getTitle());
        assertEquals("WARNING", windRec.getLevel());
    }

    @Test
    void testSevereThunderstorm_TriggersIndoorActivitiesWarning() {
        List<WeatherRecommendationDto> recs = recommendationService.generateRecommendations(
                80.0,
                1.0,
                25.0,
                22.0,
                95    // WMO 95 = Thunderstorm
        );

        WeatherRecommendationDto activityRec = recs.stream()
                .filter(r -> "OUTDOOR_ACTIVITY".equals(r.getCategory()))
                .findFirst()
                .orElse(null);

        assertNotNull(activityRec);
        assertEquals("Indoor Activities Advised", activityRec.getTitle());
        assertEquals("WARNING", activityRec.getLevel());
    }

    @Test
    void testIdealWeather_TriggersIdealOutdoorWeather() {
        List<WeatherRecommendationDto> recs = recommendationService.generateRecommendations(
                5.0,  // low rain
                3.5,  // moderate UV
                10.0, // light breeze
                22.0, // pleasant 22°C
                0     // Clear sky
        );

        WeatherRecommendationDto activityRec = recs.stream()
                .filter(r -> "OUTDOOR_ACTIVITY".equals(r.getCategory()))
                .findFirst()
                .orElse(null);

        assertNotNull(activityRec);
        assertEquals("Ideal Outdoor Weather", activityRec.getTitle());
        assertEquals("SUCCESS", activityRec.getLevel());
    }

    @Test
    void testExtremeTemperatures_HandledCorrectly() {
        // Extreme Heat (>= 34°C)
        List<WeatherRecommendationDto> heatRecs = recommendationService.generateRecommendations(
                0.0, 5.0, 10.0, 36.0, 0
        );
        assertTrue(heatRecs.stream().anyMatch(r -> "Extreme Heat Caution".equals(r.getTitle())));

        // Freezing (<= 0°C)
        List<WeatherRecommendationDto> freezingRecs = recommendationService.generateRecommendations(
                0.0, 1.0, 10.0, -2.0, 71
        );
        assertTrue(freezingRecs.stream().anyMatch(r -> "Freezing Weather Caution".equals(r.getTitle())));
    }

    @Test
    void testAllNullMetrics_DoesNotCrash() {
        // Entirely null inputs should safely return an empty or minimal list without NullPointerException
        List<WeatherRecommendationDto> recs = recommendationService.generateRecommendations(
                null, null, null, null, null
        );

        assertNotNull(recs);
        // None of the specific metric recommendations should be generated
        assertFalse(recs.stream().anyMatch(r -> "UMBRELLA".equals(r.getCategory())));
        assertFalse(recs.stream().anyMatch(r -> "SUN_PROTECTION".equals(r.getCategory())));
        assertFalse(recs.stream().anyMatch(r -> "WIND_ALERT".equals(r.getCategory())));
    }
}
