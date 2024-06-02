<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>PayMaster - Sign In</title>
<link rel="stylesheet" href="css/login.css">
</head>
<body>
<div class="header">
    <h1>Ministry of Education</h1>
</div>
<div class="container">
    <h1>Sign In to PayMaster</h1>
    <form action="#" method="post">
        <div class="form-group">
            <label for="employeeID">Employee ID</label>
            <input type="text" id="employeeID" name="employeeID" required>
        </div>
        <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" name="password" required>
        </div>
        <div class="form-group">
            <button type="submit">Sign In</button>
        </div>
        <a href="#" class="forgot-password">Forgot Password?</a>
        <a href="#" class="register-link">Register Here</a>
    </form>
</div>
<div class="footer">
    &copy; <?php echo(date('Y'))?> PayMaster. All rights reserved.
    <a href="terms-of-use.php">Terms of Use</a> | 
    <a href="privacy-policy.php">Privacy Policy</a>
</div>
</body>
</html>