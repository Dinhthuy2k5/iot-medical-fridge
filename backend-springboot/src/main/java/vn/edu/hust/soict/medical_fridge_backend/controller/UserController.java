package vn.edu.hust.soict.medical_fridge_backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.edu.hust.soict.medical_fridge_backend.dto.UpdateProfileRequest;
import vn.edu.hust.soict.medical_fridge_backend.service.UserService;

import java.security.Principal;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PutMapping("/profile")
    public ResponseEntity<String> updateProfile(
            @RequestBody UpdateProfileRequest request,
            Principal principal // Tính năng thần thánh: Tự động bắt được người đang gọi API là ai thông qua cái Token!
    ) {
        // Truyền username của người đang gọi API và dữ liệu cần sửa xuống Service
        userService.updateProfile(principal.getName(), request);
        return ResponseEntity.ok("Cập nhật thành công");
    }
}