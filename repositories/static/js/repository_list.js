$(document).ready(function () {
    // Function to get CSRF token from cookies
    function getCSRFToken() {
        const csrfToken = document.cookie.match(/csrftoken=([\w-]+)/);
        if (csrfToken) {
            return csrfToken[1];
        } else {
            console.error('CSRF token not found in cookies.');
            return null;
        }
    }

    // Function to handle item deletion
    function deleteRepository(repositoryId, rowElement) {
        $.ajax({
            url: '/repository/' + repositoryId + '/delete',
            type: 'DELETE',
            beforeSend: function (xhr, settings) {
                xhr.setRequestHeader("X-CSRFToken", getCSRFToken());
            },
            success: function (data) {
                // Handle success response
                $status = data["status"];
                if ($status == "success") {

                    $('#toast-success').find('.toast-body').text(data["message"]);
                    $('#toast-success').toast('show');
                    // location.reload(); // Reload the page to refresh the user list
                }
                // console.log('Item deleted successfully.');
                // Remove the row from the DataTable
                rowElement.remove();
            },
            error: function (xhr, status, error) {
                // Handle errors
                console.error('Error deleting repository:', error);
            }
        });
    }

    // AJAX request to fetch repositories data
    $.get("api/repositories", function (data, response) {
        // Destroy existing DataTable
        $('#repositories-table').DataTable().destroy();

        // Clear existing table rows
        $('#repositories-table').find('tbody').empty();

        // Iterate over each repository in the data and append rows to the table
        for (var i = 0; i < data.length; i++) {
            var line = '<tr class="' + data[i].id + '">' +
                '<td>' + data[i].name + '</td>' +
                '<td>' +
                '<a class="btn btn-primary btn-sm editbtn" href="#" data-repository-id="' + data[i].id + '" style="margin-right:3px"><i class="fas fa-pen-to-square"></i></a>' +
                '<a class="btn btn-danger btn-sm delbtn" data-repository-id="' + data[i].id + '"><i class="fas fa-trash"></i></a>' +
                '</td>' +
                '</tr>';

            $('#repositories-table').find('tbody').append(line);
        }

        // Initialize DataTable with the updated table content
        $('#repositories-table').DataTable({
            "language": {
                "lengthMenu": "Affichage _MENU_ pages",
                "zeroRecords": "Pas d'éléments",
                "info": "Affichage de _PAGE_ of _PAGES_",
                "infoEmpty": "Pas d'éléments",
                "infoFiltered": "(filtré de _MAX_ enregistrements)",
                "search": "Recherche",
                "paginate": {
                    "previous": "Précédent",
                    "next": "Suivant"
                }
            },
            'columnDefs': [{
                'targets': [1], // column index (start from 0)
                'orderable': false, // set orderable false for selected columns
            }],
            "rowCallback": function (row, data, index) {
                $('td', row).css('background-color', 'white');
            }
        });
    });

    // Event listener for delete buttons
    $(document).on('click', '.delbtn', function () {
        // Get the user ID from the button's data attribute
        var repositoryId = $(this).data('repository-id');

        // Get the row element containing the delete button
        var rowElement = $(this).closest('tr');

        // Call the deleteItem function with the item ID and row element
        deleteRepository(repositoryId, rowElement);
    });

    //Add section part
    $("#new_repository").on("click", function () {
        $('#addRepositoryModal').modal('show');
    })

    // Add new section fields
    $("#addSection").click(function () {

        $.get("api/sections", function (data, response) {
            var options = '<option value="" selected disabled>Select Section</option>';
            for (var i = 0; i < data.length; i++) {
                options += '<option value="' + data[i].id + '">' + data[i].name + '</option>';
            }
            $("#sectionsContainer").append('<div class="section">' +

                '<div class="form-group row my-1">' +
                '<div class="col-sm-10">' +
                '<select class="form-control" name="sections[]" required>' +
                options +
                '</select>' +
                '</div>' +
                '<div class="col-sm-2">' +
                '<button type="button" class="btn btn-danger removeSection float-end">Remove</button>' +
                '</div>' +

                '</div>');
        })

    });

    // Remove subsection
    $("#sectionsContainer").on("click", ".removeSection", function () {
        $(this).closest(".section").remove();
    });

    // Handle form submission
    $("#addRepositoryForm").submit(function (event) {
        event.preventDefault(); // Prevent default form submission

        $.ajax({
            beforeSend: function (xhr, settings) {
                xhr.setRequestHeader("X-CSRFToken", getCSRFToken());
            },
            type: "POST",
            url: "repository/add_repository/", // Update this URL according to your Django URL configuration
            data: $(this).serialize(), // Serialize form data
            success: function (response) {
                $status = response["status"];
                if ($status == "success") {
                    $('#addRepositoryModal').modal('hide');
                    $('#toast-success').find('.toast-body').text(response["message"]);
                    $('#toast-success').toast('show');
                    location.reload(); // Reload the page to refresh the user list
                } else {
                    // alert(response["message"]);
                    $('#toast-error').find('.toast-body').text(response["message"]);
                    $('#toast-error').toast('show');
                }
            },
            error: function (xhr, errmsg, err) {
                console.log(xhr.status + ": " + xhr.responseText); // Log any errors
                alert("Failed to save Repository. Please try again.");
            }
        });
    });

    // $('#addCompanyForm').on('submit', function (e) {

    //     e.preventDefault();
    //     var totalFormData = new FormData($(this)[0]);
    //     totalFormData.append('_method', 'post');

    //     $.ajax({
    //         beforeSend: function (xhr, settings) {
    //             xhr.setRequestHeader("X-CSRFToken", getCSRFToken());
    //         },
    //         type: 'POST',
    //         url: 'company/add_company/',
    //         processData: false,
    //         contentType: false,
    //         data: totalFormData,
    //         success: function (response) {
    //             // Handle success response (e.g., close modal, refresh data)

    //             $status = response["status"];
    //             if ($status == "success") {
    //                 $('#addCompanyModal').modal('hide');
    //                 // alert(response["message"]);
    //                 $('#toast-success').find('.toast-body').text(response["message"]);
    //                 $('#toast-success').toast('show');
    //                 location.reload(); // Reload the page to refresh the user list
    //             } else {
    //                 // alert(response["message"]);
    //                 $('#toast-error').find('.toast-body').text(response["message"]);
    //                 $('#toast-error').toast('show');
    //             }

    //         },
    //         error: function (xhr, status, error) {
    //             // Handle error response
    //             console.error(xhr.responseText);
    //         }
    //     });
    // });
    // Event listener for edit buttons
    $(document).on('click', '.editbtn', function () {
        var repositoryId = $(this).data('repository-id');
    
        // AJAX request to fetch repository details and associated sections
        $.ajax({
            url: '/repository/get_repository_by_id/' + repositoryId + '/',
            type: 'GET',
            beforeSend: function (xhr, settings) {
                xhr.setRequestHeader("X-CSRFToken", getCSRFToken());
            },
            success: function (data) {
                $('#editRepositoryId').val(data.id);
                $('#editRepositoryName').val(data.name);
                $('#editSectionsContainer').empty(); // Clear existing sections
    
                // Fetch sections from API and populate options
                $.get("api/sections", function (sectionsData, status) {
                    $.each(data.sections, function (index, section) {
                        var options = '<option value="" disabled>Select Section</option>';
                        $.each(sectionsData, function (index, s) { // For each element, the function provided as the second argument is executed, where 's' represents the current element being processed.
                            var selected = (s.id === section.id) ? 'selected' : '';
                            options += '<option value="' + s.id + '" ' + selected + '>' + s.name + '</option>';
                        });
    
                        // Append section with its options to the container
                        $('#editSectionsContainer').append('<div class="editSection">' +
                            '<div class="form-group row my-1">' +
                            '<div class="col-sm-10">' +
                            '<select class="form-control" name="editSections[]" required>' +
                            options +
                            '</select>' +
                            '</div>' +
                            '<div class="col-sm-2">' +
                            '<button type="button" class="btn btn-danger editRemoveSection float-end">Remove</button>' +
                            '</div>' +
                            '</div>' +
                            '</div>');
                    });
                });
    
                // Show the modal
                $('#editRepositoryModal').modal('show');
            },
            error: function (xhr, status, error) {
                // Handle errors
                console.error('Error displaying repository:', error);
            }
        });
    });

     // Add new section fields
     $("#editAddSection").click(function () {

        $.get("api/sections", function (data, response) {
            var options = '<option value="" selected disabled>Select Section</option>';
            for (var i = 0; i < data.length; i++) {
                options += '<option value="' + data[i].id + '">' + data[i].name + '</option>';
            }
            $("#editSectionsContainer").append('<div class="editSection">' +

                '<div class="form-group row my-1">' +
                '<div class="col-sm-10">' +
                '<select class="form-control" name="editSections[]" required>' +
                options +
                '</select>' +
                '</div>' +
                '<div class="col-sm-2">' +
                '<button type="button" class="btn btn-danger editRemoveSection float-end">Remove</button>' +
                '</div>' +

                '</div>');
        })

    });

    // Remove section
    $("#editSectionsContainer").on("click", ".editRemoveSection", function () {
        $(this).closest(".editSection").remove();
    });



    $('#editRepositoryForm').on('submit', function (e) {

        e.preventDefault();

        $.ajax({
            beforeSend: function (xhr, settings) {
                xhr.setRequestHeader("X-CSRFToken", getCSRFToken());
            },
            type: 'POST',
            url: 'repository/edit_repository/',
            data: $(this).serialize(),
            success: function (response) {
                $status = response["status"];
                if ($status == "success") {
                    $('#editRepositoryModal').modal('hide');
                    $('#toast-success').find('.toast-body').text(response["message"]);
                    $('#toast-success').toast('show');
                    location.reload(); // Reload the page to refresh the user list
                } else {
                    // alert(response["message"]);
                    $('#toast-error').find('.toast-body').text(response["message"]);
                    $('#toast-error').toast('show');
                }
            },
            error: function (xhr, errmsg, err) {
                console.log(xhr.status + ": " + xhr.responseText); // Log any errors
                alert("Failed to edit Repository. Please try again.");
            }
        });
    });



});