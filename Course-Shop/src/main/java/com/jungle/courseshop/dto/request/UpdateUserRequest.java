package com.jungle.courseshop.dto.request;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.jungle.courseshop.entity.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UpdateUserRequest {
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    private String fullname;

    private MultipartFile avatar;
    private String gender;
    @JsonFormat(pattern = "dd/MM/yyyy")
    private LocalDate yob;

    @Email(message = "Email must be valid!!")
    private String email;
    @Pattern(regexp = "(84|0[3|5|7|8|9])+([0-9]{8})\\b", message = "Phone invalid!!" )
    private String phone;
    private String address;

    private Role role;
}
