<?php
session_start();
error_reporting(0);
include('includes/config.php');
if(strlen($_SESSION['alogin'])==0) {   
    header('location:index.php');
} else {
    if(isset($_POST['add'])) {
        $empid      = $_POST['empcode'];
        $fname      = $_POST['firstName'];
        $lname      = $_POST['lastName'];
        $email      = $_POST['email'];
        $password   = md5($_POST['password']);
        $gender     = $_POST['gender'];
        $dob        = $_POST['dob'];
        $department = $_POST['department'];
        $address    = $_POST['address'];
        $city       = $_POST['city'];
        $country    = $_POST['country'];
        $mobileno   = $_POST['mobileno'];
        $status     = 1;

        $sql="INSERT INTO tblemployees(EmpId,FirstName,LastName,EmailId,Password,Gender,Dob,Department,Address,City,Country,Phonenumber,Status) 
              VALUES(:empid,:fname,:lname,:email,:password,:gender,:dob,:department,:address,:city,:country,:mobileno,:status)";
        $query = $dbh->prepare($sql);
        $query->bindParam(':empid',$empid,PDO::PARAM_STR);
        $query->bindParam(':fname',$fname,PDO::PARAM_STR);
        $query->bindParam(':lname',$lname,PDO::PARAM_STR);
        $query->bindParam(':email',$email,PDO::PARAM_STR);
        $query->bindParam(':password',$password,PDO::PARAM_STR);
        $query->bindParam(':gender',$gender,PDO::PARAM_STR);
        $query->bindParam(':dob',$dob,PDO::PARAM_STR);
        $query->bindParam(':department',$department,PDO::PARAM_STR);
        $query->bindParam(':address',$address,PDO::PARAM_STR);
        $query->bindParam(':city',$city,PDO::PARAM_STR);
        $query->bindParam(':country',$country,PDO::PARAM_STR);
        $query->bindParam(':mobileno',$mobileno,PDO::PARAM_STR);
        $query->bindParam(':status',$status,PDO::PARAM_STR);
        $query->execute();
        $lastInsertId = $dbh->lastInsertId();
        if($lastInsertId) {
            $msg="Employee record added Successfully";
        } else {
            $error="Something went wrong. Please try again";
        }
    }
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <title>Admin | Add Employee</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"/>
    <meta charset="UTF-8">

    <!-- Styles -->
    <link type="text/css" rel="stylesheet" href="../assets/plugins/materialize/css/materialize.min.css"/>
    <link type="text/css" rel="stylesheet" href="../assets/plugins/materialize/css/materialize.css"/>
    <link href="http://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
    <link href="../assets/plugins/material-preloader/css/materialPreloader.min.css" rel="stylesheet">
    <link href="../assets/css/alpha.min.css" rel="stylesheet" type="text/css"/>
    <link href="../assets/css/custom.css" rel="stylesheet" type="text/css"/>
    <link href="../assets/css/style.css" rel="stylesheet" type="text/css"/>

    <style>
        .errorWrap {padding:10px;margin:0 0 20px 0;background:#fff;border-left:4px solid #dd3d36;box-shadow:0 1px 1px 0 rgba(0,0,0,.1);}
        .succWrap {padding:10px;margin:0 0 20px 0;background:#fff;border-left:4px solid #5cb85c;box-shadow:0 1px 1px 0 rgba(0,0,0,.1);}
    </style>

    <script type="text/javascript">
        function valid() {
            if(document.addemp.password.value!= document.addemp.confirmpassword.value) {
                alert("New Password and Confirm Password Field do not match !!");
                document.addemp.confirmpassword.focus();
                return false;
            }
            return true;
        }
        function checkAvailabilityEmpid() {
            jQuery.ajax({
                url: "check_availability.php",
                data:'empcode='+$("#empcode").val(),
                type: "POST",
                success:function(data){ $("#empid-availability").html(data); },
                error:function (){}
            });
        }
        function checkAvailabilityEmailid() {
            jQuery.ajax({
                url: "check_availability.php",
                data:'emailid='+$("#email").val(),
                type: "POST",
                success:function(data){ $("#emailid-availability").html(data); },
                error:function (){}
            });
        }
    </script>
</head>
<body>
<?php include('includes/header.php');?>
<?php include('includes/sidebar.php');?>

<main class="mn-inner">
    <div class="row">
        <div class="col s12">
            <div class="page-title blue-gray-text text-darken-2">Add Employee</div>
        </div>
        <div class="col s12 m12 l12">
            <div class="card">
                <div class="card-content">
                    <form id="example-form" method="post" name="addemp">
                        <div class="row">
                            <?php if($error){?><div class="errorWrap"><strong>ERROR</strong>:<?php echo htmlentities($error); ?> </div><?php } 
                            else if($msg){?><div class="succWrap"><strong>SUCCESS</strong>:<?php echo htmlentities($msg); ?> </div><?php }?>
                            
                            <div class="input-field col s12">
                                <label for="empcode">Employee Code (Must be unique)</label>
                                <input name="empcode" id="empcode" onBlur="checkAvailabilityEmpid()" type="text" required>
                                <span id="empid-availability" style="font-size:12px;"></span>
                            </div>
                            <div class="input-field col m6 s12">
                                <label for="firstName">First Name</label>
                                <input id="firstName" name="firstName" type="text" required>
                            </div>
                            <div class="input-field col m6 s12">
                                <label for="lastName">Last Name</label>
                                <input id="lastName" name="lastName" type="text" required>
                            </div>
                            <div class="input-field col s12">
                                <label for="email">Email</label>
                                <input name="email" type="email" id="email" onBlur="checkAvailabilityEmailid()" required>
                                <span id="emailid-availability" style="font-size:12px;"></span>
                            </div>
                            <div class="input-field col s12">
                                <label for="password">Password</label>
                                <input id="password" name="password" type="password" required>
                            </div>
                            <div class="input-field col s12">
                                <label for="confirmpassword">Confirm Password</label>
                                <input id="confirmpassword" name="confirmpassword" type="password" required>
                            </div>
                            <div class="input-field col m6 s12">
                                <select name="gender" required>
                                    <option value="">Gender...</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div class="input-field col m6 s12">
                                <label for="birthdate">Birthdate</label>
                                <input id="birthdate" name="dob" type="text" class="datepicker">
                            </div>
                            <div class="input-field col m6 s12">
                                <select name="department" required>
                                    <option value="">Department...</option>
                                    <?php 
                                    $sql = "SELECT DepartmentName from tbldepartments";
                                    $query = $dbh -> prepare($sql);
                                    $query->execute();
                                    $results=$query->fetchAll(PDO::FETCH_OBJ);
                                    if($query->rowCount() > 0) {
                                        foreach($results as $result) { ?> 
                                            <option value="<?php echo htmlentities($result->DepartmentName);?>">
                                                <?php echo htmlentities($result->DepartmentName);?>
                                            </option>
                                    <?php }} ?>
                                </select>
                            </div>
                            <div class="input-field col m6 s12">
                                <label for="country">Country</label>
                                <input id="country" name="country" type="text" required>
                            </div>
                            <div class="input-field col m6 s12">
                                <label for="city">City/Town</label>
                                <input id="city" name="city" type="text" required>
                            </div>
                            <div class="input-field col m6 s12">
                                <label for="address">Address</label>
                                <input id="address" name="address" type="text" required>
                            </div>
                            <div class="input-field col s12">
                                <label for="phone">Mobile Number</label>
                                <input id="phone" name="mobileno" type="tel" maxlength="10" required>
                            </div>
                            <div class="input-field col s12" style="margin-top:30px;">
                                <button type="submit" name="add" onclick="return valid();" class="waves-effect waves-light btn indigo m-b-xs">ADD</button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</main>

<div class="left-sidebar-hover"></div>

<!-- JS -->
<script src="../assets/plugins/jquery/jquery-2.2.0.min.js"></script>
<script src="../assets/plugins/materialize/js/materialize.min.js"></script>
<script src="../assets/plugins/material-preloader/js/materialPreloader.min.js"></script>
<script src="../assets/plugins/jquery-blockui/jquery.blockui.js"></script>
<script src="../assets/js/alpha.min.js"></script>
<script src="../assets/js/pages/form_elements.js"></script>

<!-- Safe Init -->
<script>
document.addEventListener('DOMContentLoaded', function() {
    // Select init
    if (typeof M !== "undefined" && M.FormSelect) {
        var elems = document.querySelectorAll('select');
        M.FormSelect.init(elems);
    } else if (typeof $ !== "undefined" && $.fn.material_select) {
        $('select').material_select();
    }

    // Datepicker init
    if (typeof M !== "undefined" && M.Datepicker) {
        var elemsDate = document.querySelectorAll('.datepicker');
        M.Datepicker.init(elemsDate, {
            format: 'yyyy-mm-dd',
            yearRange: 100
        });
    } else if (typeof $ !== "undefined" && $.fn.pickadate) {
        $('.datepicker').pickadate({
            format: 'yyyy-mm-dd',
            selectMonths: true,
            selectYears: 100
        });
    }
});
</script>
</body>
</html>
<?php } ?>
