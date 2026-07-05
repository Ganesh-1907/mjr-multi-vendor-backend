class ApiResponse {
  static success(data, message = 'Success') {
    return {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  static error(message, statusCode = 400) {
    return {
      success: false,
      message,
      data: null,
      timestamp: new Date().toISOString(),
    };
  }
}

module.exports = ApiResponse;
