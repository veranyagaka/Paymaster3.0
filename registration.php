<!DOCTYPE html>
<html>
<head>
    <title>Employee Registration</title>
    <link rel="stylesheet" type="text/css" href="css/registration.css">
</head>
<body>
    <div class="container">
        <h2>NEW EMPLOYEE ACTIVATION FORM</h2>
        <p>Use this form to activate your UPN account. The information will be validated against your record in the Ministry of Education. In case of disparities, contact the HRM Unit.</p>
        <form action="submit_registration.php" method="post">
            <label for="national_id">National ID Card / Passport Number:</label><br>
            <input type="text" id="national_id" name="national_id" required><br><br>

            <label for="kra_pin">KRA PIN:</label><br>
            <input type="text" id="kra_pin" name="kra_pin" required><br><br>

            <label for="first_name">First Name:</label><br>
            <input type="text" id="first_name" name="first_name" required><br><br>

            <label for="surname">Surname:</label><br>
            <input type="text" id="surname" name="surname" required><br><br>

            <label for="email">Email Address:</label><br>
            <input type="email" id="email" name="email" required><br><br>

            <label for="password">Create your Password:</label><br>
            <input type="password" id="password" name="password" required><br><br>

            <label for="confirm_password">Confirm your Password:</label><br>
            <input type="password" id="confirm_password" name="confirm_password" required><br><br>

            <input type="reset" value="Reset">
            <input type="submit" value="Submit">
        </form>
    </div>
</body>
</html>
