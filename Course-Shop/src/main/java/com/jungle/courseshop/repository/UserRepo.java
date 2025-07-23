package com.jungle.courseshop.repository;

import com.jungle.courseshop.entity.Role;
import com.jungle.courseshop.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepo extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByUsernameAndEnabledTrue(String username);
    Optional<User> findByUsername(String username);
    List<User> findAllByEnabled(boolean enabled);

    List<User> findByRoleAndEnabled(Role role, boolean enabled);

    Boolean existsByEmail(String email);
    Boolean existsByUsername(String username);

    List<User> findByEnabledTrue();
    Optional<User> findByIdAndEnabledTrue(Long id);
}
