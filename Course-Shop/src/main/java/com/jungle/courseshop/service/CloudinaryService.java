package com.jungle.courseshop.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
@RequiredArgsConstructor
public class CloudinaryService {

    private final Cloudinary cloudinary;

    public String uploadFile(MultipartFile file) throws IOException {
        var result = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                "folder", "/upload",
                "use_filename", true,
                "unique_filename", true,
                "resource_type", "auto"
        ));

        return result.get("secure_url").toString();
    }
}
