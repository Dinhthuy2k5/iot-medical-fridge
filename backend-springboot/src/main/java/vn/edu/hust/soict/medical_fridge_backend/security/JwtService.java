package vn.edu.hust.soict.medical_fridge_backend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.function.Function;

@Service
public class JwtService {
    // Spring sẽ tự động lấy giá trị từ file properties đắp vào đây
    @Value("${jwt.secret}")
    private String secretKey;


    // Hàm lấy tên đăng nhập (username) từ trong Thẻ
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    // Hàm in Thẻ mới cho người dùng
    public String generateToken(UserDetails userDetails) {
        return Jwts.builder()
                .setClaims(new HashMap<>()) // Các thông tin phụ (nếu có)
                .setSubject(userDetails.getUsername()) // Tên người dùng
                .setIssuedAt(new Date(System.currentTimeMillis())) // Ngày cấp
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 24)) // Hạn sử dụng (24 giờ)
                .signWith(getSignInKey(), SignatureAlgorithm.HS256) // Đóng dấu bằng chữ ký bí mật
                .compact();
    }

    // Hàm kiểm tra Thẻ có hợp lệ và còn hạn không
    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername())) && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSignInKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private Key getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}