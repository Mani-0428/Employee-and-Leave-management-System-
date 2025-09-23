     <aside id="slide-out" class="side-nav white fixed">
                <div class="side-nav-wrapper">
                    <div class="sidebar-profile">
                        <div class="sidebar-profile-image">
                            <img src="../assets/images/profile-image.jpg" class="circle" alt="">
                        </div>
                        <div class="sidebar-profile-info">
                       
                                <p>Admin</p>

                         
                        </div>
                    </div>
                
                    <?php 
                    $page = explode("?",array_reverse(explode("/",$_SERVER['PHP_SELF']))[0])[0];
                    ?>
                <ul class="sidebar-menu collapsible collapsible-accordion" data-collapsible="accordion">
                    <li class="no-padding <?= $page == 'dashboard.php' ? 'active' : '' ?>"><a class="waves-effect waves-grey" href="dashboard.php"><i class="material-icons">settings_input_svideo</i>Dashboard</a></li>
                    <li class="no-padding <?= in_array($page,['adddepartment.php', 'managedepartments.php']) ? 'active' : '' ?>">
                        <a class="collapsible-header waves-effect waves-grey"><i class="material-icons">apps</i>Department<i class="nav-drop-icon material-icons">keyboard_arrow_right</i></a>
                        <div class="collapsible-body">
                            <ul>
                                <li class=" <?= $page == 'adddepartment.php' ? 'blue-grey-text text-darken-2' : '' ?>"><a href="adddepartment.php">Add Department</a></li>
                                <li class=" <?= $page == 'managedepartments.php' ? 'blue-grey-text text-darken-2' : '' ?>"><a href="managedepartments.php">Manage Department</a></li>
                            </ul>
                        </div>
                    </li>
                    <li class="no-padding <?= in_array($page,['addleavetype.php', 'manageleavetype.php']) ? 'active' : '' ?>">
                        <a class="collapsible-header waves-effect waves-grey"><i class="material-icons">code</i>Leave Type<i class="nav-drop-icon material-icons">keyboard_arrow_right</i></a>
                        <div class="collapsible-body">
                            <ul>
                                <li class=" <?= $page == 'addleavetype.php' ? 'blue-grey-text text-darken-2' : '' ?>"><a href="addleavetype.php">Add Leave Type</a></li>
                                <li class=" <?= $page == 'manageleavetype.php' ? 'blue-grey-text text-darken-2' : '' ?>"><a href="manageleavetype.php">Manage Leave Type</a></li>
                            </ul>
                        </div>
                    </li>
                    <li class="no-padding">
                        <a class="collapsible-header waves-effect waves-grey"><i class="material-icons">account_box</i>Employees<i class="nav-drop-icon material-icons">keyboard_arrow_right</i></a>
                        <div class="collapsible-body">
                            <ul>
                                <li><a href="addemployee.php">Add Employee</a></li>
                                <li><a href="manageemployee.php">Manage Employee</a></li>
       
                            </ul>
                        </div>
                    </li>

   <li class="no-padding">
                        <a class="collapsible-header waves-effect waves-grey"><i class="material-icons">desktop_windows</i>Leave Management<i class="nav-drop-icon material-icons">keyboard_arrow_right</i></a>
                        <div class="collapsible-body">
                            <ul>
                                <li><a href="leaves.php">All Leaves </a></li>
                                <li><a href="pending-leavehistory.php">Pending Leaves </a></li>
                                <li><a href="approvedleave-history.php">Approved Leaves</a></li>
                                  <li><a href="notapproved-leaves.php">Not Approved Leaves</a></li>
       
                            </ul>
                        </div>
                    </li>


  <li class="no-padding"><a class="waves-effect waves-grey" href="changepassword.php"><i class="material-icons">settings_input_svideo</i>Change Password</a></li>

                        <li class="no-padding">
                                <a class="waves-effect waves-grey" href="logout.php"><i class="material-icons">exit_to_app</i>Log Out</a>
                            </li>  
                 

                 
              
                </ul>
                   <div class="footer">
                    <p class="copyright"><a target="__blank" href="https://platoontitleservices.com/">PLATOON ELMS </a>©</p>
                
                </div>
                </div>
            </aside>
            <script>
                $(function(){
                   
                    var page = '<?= $page ?>';
                    if($('.sidebar-menu a[href="'+page+'"]').length > 0){
                        if($('.sidebar-menu a[href="'+page+'"]').closest('.collapsible-body').siblings('.collapsible-header').length > 0){
                            $('.sidebar-menu a[href="'+page+'"]').closest('.collapsible-body').siblings('.collapsible-header').trigger('click')
                        }

                    }
                })
            </script>