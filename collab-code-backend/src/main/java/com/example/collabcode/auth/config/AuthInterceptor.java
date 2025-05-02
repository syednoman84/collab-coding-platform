package com.example.collabcode.auth.config;

import com.example.collabcode.auth.annotation.RequireAdmin;
import com.example.collabcode.auth.annotation.RequireAuth;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class AuthInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {

        if (!(handler instanceof HandlerMethod handlerMethod)) {
            return true;
        }

        boolean requireAdmin = handlerMethod.hasMethodAnnotation(RequireAdmin.class)
                || handlerMethod.getBeanType().isAnnotationPresent(RequireAdmin.class);

        boolean requireAuth = handlerMethod.hasMethodAnnotation(RequireAuth.class)
                || handlerMethod.getBeanType().isAnnotationPresent(RequireAuth.class);

        HttpSession session = request.getSession(false);

        if (requireAdmin) {
            if (session == null || !"admin".equals(session.getAttribute("role"))) {
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized: ADMIN only");
                return false;
            }
        } else if (requireAuth) {
            if (session == null || session.getAttribute("username") == null) {
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized: Login required");
                return false;
            }
        }

        return true;
    }
}
