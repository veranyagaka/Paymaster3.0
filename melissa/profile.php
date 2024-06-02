<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Employee Profile</title>
<link rel="stylesheet" href="styles.css">
</head>
<body>
<div class="container">
    <h1>Employee Profile</h1>
    <div class="profile">
        <div class="profile-image">
            <!-- Your profile image here -->
            <img src="profile.jpg" alt="Profile Image">
        </div>
        <div class="profile-details">
            <h2>Name: <span class="placeholder">John Doe</span></h2>
            <p>Employee ID: <span class="placeholder">123456</span></p>
            <p>Position: <span class="placeholder">Software Engineer</span></p>
            <p>Department: <span class="placeholder">Engineering</span></p>
            <p>Email: <span class="placeholder">john.doe@example.com</span></p>
            <p>Phone: <span class="placeholder">+1 234 567 890</span></p>
            <p>Address: <span class="placeholder">123 Main Street, City, Country</span></p>
            <p>Date of Birth: <span class="placeholder">January 1, 1990</span></p>
            <p>Joining Date: <span class="placeholder">January 1, 2015</span></p>
            <button class="edit-button">Edit</button>
        </div>
    </div>
    <div class="additional-details">
        <h2>Additional Details</h2>
        <p>Skills: <span class="placeholder">HTML, CSS, JavaScript, PHP</span></p>
        <p>Education: <span class="placeholder">Bachelor's Degree in Computer Science</span></p>
        <p>Certifications: <span class="placeholder">Microsoft Certified Professional (MCP)</span></p>
        <p>Training History: <span class="placeholder">Completed leadership training in 2020</span></p>
        <p>Performance Ratings: <span class="placeholder">Exceeds Expectations</span></p>
        <p>Salary Details: <span class="placeholder">$80,000 per year</span></p>
        <p>Leave Balance: <span class="placeholder">10 days</span></p>
        <p>Emergency Contact: <span class="placeholder">Jane Doe, +1 234 567 890</span></p>
        <!-- Overtime Hours -->
        <?php
        // Assume $overtimeHours is the variable containing overtime hours fetched from the database
        $overtimeHours = 10;
        ?>
        <p>Overtime Hours: <span class="placeholder"><?php echo $overtimeHours; ?> hours</span></p>
    </div>
</div>
</body>
</html>
