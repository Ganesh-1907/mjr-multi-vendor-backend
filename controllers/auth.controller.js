const authService = require('../services/auth.service');
const ApiResponse = require('../utils/ApiResponse');

const login = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;
    const data = await authService.login(email, password, role);
    res.json(ApiResponse.success(data, 'Login successful'));
  } catch (error) {
    next(error);
  }
};



const register = async (req, res, next) => {
  try {
    const data = await authService.register(req.body);
    res.json(ApiResponse.success(data, 'Registration successful'));
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    await authService.sendForgotPasswordOtp(email);
    res.json(ApiResponse.success(null, 'OTP sent for password reset'));
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, password } = req.body;
    await authService.resetPassword(email, otp, password);
    res.json(ApiResponse.success(null, 'Password reset successful'));
  } catch (error) {
    next(error);
  }
};

module.exports = { login, register, forgotPassword, resetPassword };
