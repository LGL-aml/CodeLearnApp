package com.jungle.courseshop;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class CourseShopApplication {

    public static void main(String[] args) {
        SpringApplication.run(CourseShopApplication.class, args);
    }

}
