<?php
include 'config.php';

if (is_logged_in()) {
    if (is_admin()) {
        header("Location: admin_dashboard.php");
    } else {
        header("Location: employee_dashboard.php");
    }
} else {
    header("Location: login.php");
}
exit();

