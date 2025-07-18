package com.jungle.courseshop.dto.response;

import com.jungle.courseshop.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UpdateUserResponse {

    private Long id;

    private String username;
    private String fullname;
    private String avatar;
    private LocalDate yob;
    private String gender;

    private String email;
    private String phone;
    private String address;

    private Role role;
    private String message;

}