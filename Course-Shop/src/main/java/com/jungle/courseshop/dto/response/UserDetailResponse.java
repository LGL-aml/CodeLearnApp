package com.jungle.courseshop.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@Builder
public class UserDetailResponse {
    private Long id;
    private String username;
    private String email;
    private String phone;
    private String fullName;
    private String gender;

    @JsonFormat(pattern = "dd/MM/yyyy")
    private LocalDate yob;
    private String avatar;
    private String address;
    private String role;
}
