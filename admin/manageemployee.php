<?php
session_start();
error_reporting(0);
include('includes/config.php');

if(strlen($_SESSION['alogin'])==0) {   
    header('location:index.php');
} else {

    // Inactive employee
    if(isset($_GET['inid'])) {
        $id = $_GET['inid'];
        $status = 0;
        $sql = "UPDATE tblemployees SET Status=:status WHERE id=:id";
        $query = $dbh->prepare($sql);
        $query->bindParam(':id', $id, PDO::PARAM_STR);
        $query->bindParam(':status', $status, PDO::PARAM_STR);
        $query->execute();
        header('location:manageemployee.php');
    }

    // Active employee
    if(isset($_GET['id'])) {
        $id = $_GET['id'];
        $status = 1;
        $sql = "UPDATE tblemployees SET Status=:status WHERE id=:id";
        $query = $dbh->prepare($sql);
        $query->bindParam(':id', $id, PDO::PARAM_STR);
        $query->bindParam(':status', $status, PDO::PARAM_STR);
        $query->execute();
        header('location:manageemployee.php');
    }
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <title>Admin | Manage Employees</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"/>
    <meta charset="UTF-8">
    <meta name="description" content="Responsive Admin Dashboard Template" />
    <meta name="keywords" content="admin,dashboard" />
    <meta name="author" content="Steelcoders" />

    <!-- Styles -->
    <link type="text/css" rel="stylesheet" href="../assets/plugins/materialize/css/materialize.min.css"/>
    <link type="text/css" rel="stylesheet" href="../assets/plugins/materialize/css/materialize.css"/>
    <link href="http://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
    <link href="../assets/plugins/material-preloader/css/materialPreloader.min.css" rel="stylesheet">
    <link href="../assets/plugins/datatables/css/jquery.dataTables.min.css" rel="stylesheet">

    <!-- Theme Styles -->
    <link href="../assets/css/alpha.min.css" rel="stylesheet" type="text/css"/>
    <link href="../assets/css/custom.css" rel="stylesheet" type="text/css"/>
    <link href="../assets/css/style.css" rel="stylesheet" type="text/css"/>

    <!-- jQuery -->
    <script src="../assets/plugins/jquery/jquery-2.2.0.min.js"></script>

    <style>
        .errorWrap {
            padding: 10px;
            margin: 0 0 20px 0;
            background: #fff;
            border-left: 4px solid #dd3d36;
            box-shadow: 0 1px 1px 0 rgba(0,0,0,.1);
        }
        .succWrap {
            padding: 10px;
            margin: 0 0 20px 0;
            background: #fff;
            border-left: 4px solid #5cb85c;
            box-shadow: 0 1px 1px 0 rgba(0,0,0,.1);
        }
    </style>
</head>
<body>
    <?php include('includes/header.php');?>
    <?php include('includes/sidebar.php');?>

    <main class="mn-inner">
        <div class="row">
            <div class="col s12">
                <div class="page-title blue-gray-text text-darken-2">Manage Employees</div>
            </div>
            <div class="col s12 m12 l12">
                <div class="card">
                    <div class="card-content">

                        <?php if($msg){ ?>
                            <div class="succWrap"><strong>SUCCESS</strong> : <?php echo htmlentities($msg); ?> </div>
                        <?php } ?>

                        <table id="example" class="display responsive-table">
                            <thead>
                                <tr>
                                    <th>Sl no</th>
                                    <th>Emp Id</th>
                                    <th>Emp Name</th>
                                    <th>Department</th>
                                    <th>Status</th>
                                    <th>Reg Date</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                            <?php 
                            $sql = "SELECT EmpId,FirstName,LastName,Department,Status,RegDate,id FROM tblemployees";
                            $query = $dbh->prepare($sql);
                            $query->execute();
                            $results = $query->fetchAll(PDO::FETCH_OBJ);
                            $cnt = 1;
                            if($query->rowCount() > 0) {
                                foreach($results as $result) { ?>  
                                    <tr>
                                        <td><?php echo htmlentities($cnt);?></td>
                                        <td><?php echo htmlentities($result->EmpId);?></td>
                                        <td><?php echo htmlentities($result->FirstName . ' ' . $result->LastName);?></td>
                                        <td><?php echo htmlentities($result->Department);?></td>
                                        <td>
                                            <?php if($result->Status){ ?>
                                                <a class="waves-effect waves-green btn-flat m-b-xs">Active</a>
                                            <?php } else { ?>
                                                <a class="waves-effect waves-red btn-flat m-b-xs">Inactive</a>
                                            <?php } ?>
                                        </td>
                                        <td><?php echo htmlentities($result->RegDate);?></td>
                                        <td>
                                            <a href="editemployee.php?empid=<?php echo htmlentities($result->id);?>">
                                                <i class="material-icons">mode_edit</i>
                                            </a>
                                            <?php if($result->Status==1) { ?>
                                                <a href="manageemployee.php?inid=<?php echo htmlentities($result->id);?>" 
                                                   onclick="return confirm('Are you sure you want to inactive this employee?');">
                                                   <i class="material-icons" title="Inactive">clear</i>
                                                </a>
                                            <?php } else { ?>
                                                <a href="manageemployee.php?id=<?php echo htmlentities($result->id);?>" 
                                                   onclick="return confirm('Are you sure you want to active this employee?');">
                                                   <i class="material-icons" title="Active">done</i>
                                                </a>
                                            <?php } ?>
                                        </td>
                                    </tr>
                                <?php $cnt++; } } ?>
                            </tbody>
                        </table>

                    </div>
                </div>
            </div>
        </div>
    </main>

    <div class="left-sidebar-hover"></div>

    <!-- Javascripts -->
    <script src="../assets/plugins/materialize/js/materialize.min.js"></script>
    <script src="../assets/plugins/material-preloader/js/materialPreloader.min.js"></script>
    <script src="../assets/plugins/jquery-blockui/jquery.blockui.js"></script>
    <script src="../assets/plugins/datatables/js/jquery.dataTables.min.js"></script>
    <script src="../assets/js/alpha.min.js"></script>
    <script src="../assets/js/pages/table-data.js"></script>

    <!-- Safe Materialize init -->
    <script>
    document.addEventListener('DOMContentLoaded', function() {
        if (typeof M !== "undefined" && M.AutoInit) {
            M.AutoInit(); // For Materialize 1.x
        } else if (typeof $ !== "undefined" && $.fn.material_select) {
            $('select').material_select(); // For Materialize 0.97.x
        }
    });
    </script>
</body>
</html>
<?php } ?>
