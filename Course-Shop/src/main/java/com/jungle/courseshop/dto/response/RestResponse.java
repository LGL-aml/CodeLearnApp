package com.jungle.courseshop.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class RestResponse<T> {
    private int statusCode;
    private String error;
    private Object message;
    private T data;

    public static <T> RestResponse<T> error(int status, String error, Object message) {
        return new RestResponse<>(status, error, message, null); // data là danh sách rỗng
    }

    public static <T> RestResponse<T> success(T data) {
        return new RestResponse<>(200, null, "Success", data);
    }

}
