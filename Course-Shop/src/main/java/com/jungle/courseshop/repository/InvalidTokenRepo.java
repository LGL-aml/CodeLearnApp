package com.jungle.courseshop.repository;

import com.jungle.courseshop.entity.InvalidatedToken;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InvalidTokenRepo extends JpaRepository<InvalidatedToken, String> {
}
