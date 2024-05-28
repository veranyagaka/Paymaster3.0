<?php
include 'config.php';
require_login();
require_admin();
?>

<!DOCTYPE html>
<html>
<head>
    <title>Admin Dashboard</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <h2>Welcome Admin, <?php echo htmlspecialchars($_SESSION['username']); ?></h2>
    <p><a href="logout.php">Logout</a></p>
</body>
</html>
