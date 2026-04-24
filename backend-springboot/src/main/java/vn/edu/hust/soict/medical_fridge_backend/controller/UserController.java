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
    public ResponseEntity<?> updateProfile(
            @RequestBody UpdateProfileRequest request,
            Principal principal
    ) {
        try {
            userService.updateProfile(principal.getName(), request);
            return ResponseEntity.ok("Cập nhật thành công");
        } catch (RuntimeException e) {
            // 💡 Trả về mã lỗi 400 (Bad Request) kèm câu thông báo lỗi
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}