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
    function deleteSection(sectionId, rowElement) {
        $.ajax({
            url: '/section/' + sectionId + '/delete',
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
                console.error('Error deleting user:', error);
            }
        });
    }

    // AJAX request to fetch companies data
    $.get("api/sections", function (data, response) {
        // Destroy existing DataTable
        $('#sections-table').DataTable().destroy();

        // Clear existing table rows
        $('#sections-table').find('tbody').empty();

        // Iterate over each section in the data and append rows to the table
        for (var i = 0; i < data.length; i++) {
            var line = '<tr class="' + data[i].id + '">' +
                '<td>' + data[i].id + '</td>' +
                '<td>' + data[i].name + '</td>' +
                '<td>' +
                '<a class="btn btn-primary btn-sm editbtn" href="#" data-section-id="' + data[i].id + '" style="margin-right:3px"><i class="fas fa-pen-to-square"></i></a>' +
                '<a class="btn btn-danger btn-sm delbtn" data-section-id="' + data[i].id + '"><i class="fas fa-trash"></i></a>' +
                '</td>' +
                '</tr>';

            $('#sections-table').find('tbody').append(line);
        }

        // Initialize DataTable with the updated table content
        $('#sections-table').DataTable({
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
        var sectionId = $(this).data('section-id');

        // Get the row element containing the delete button
        var rowElement = $(this).closest('tr');

        // Call the deleteItem function with the item ID and row element
        deleteSection(sectionId, rowElement);
    });

    //Add section part
    $("#new_section").on("click", function () {
        $('#addSectionModal').modal('show');
    })

    // Add new subsection fields
    $("#addSubsection").click(function () {
        $("#subsectionsContainer").append('<div class="subSection">' +
            '<div class="form-group row my-1">' +
            '<label for="subsectionName" class="col-sm-3 col-form-label">Subsection Name:</label>' +
            '<div class="col-sm-9">' +
            '<input type="text" class="form-control" name="subsections[]" required>' +
            '</div>' +
            '</div>' +
            '<div class="form-group row my-1">' +
            '<label for="subsectionDescription" class="col-sm-3 col-form-label">Subsection Description:</label>' +
            '<div class="col-sm-9">' +
            '<textarea class="form-control" name="descriptions[]" required></textarea>' +
            '</div>' +
            '</div>' +
            '<div class="form-group row my-1">' +
            '<div class="col-sm-9 offset-sm-3">' +
            '<button type="button" class="btn btn-danger removeSubsection">Remove</button>' +
            '</div>' +
            '</div>' +
            '</div>');
    });

    // Remove subsection
    $("#subsectionsContainer").on("click", ".removeSubsection", function () {
        $(this).closest(".subSection").remove();
    });

    // Handle form submission
    $("#addSectionForm").submit(function (event) {
        event.preventDefault(); // Prevent default form submission

        $.ajax({
            beforeSend: function (xhr, settings) {
                xhr.setRequestHeader("X-CSRFToken", getCSRFToken());
            },
            type: "POST",
            url: "section/add_section/", // Update this URL according to your Django URL configuration
            data: $(this).serialize(), // Serialize form data
            success: function (response) {
                $status = response["status"];
                if ($status == "success") {
                    $('#addSectionModal').modal('hide');
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
                alert("Failed to save Section and Subsections. Please try again.");
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
        var sectionId = $(this).data('section-id');

        // AJAX request to fetch section details and subsections
        $.ajax({
            url: '/section/get_section_by_id/' + sectionId + '/',
            type: 'GET',
            beforeSend: function (xhr, settings) {
                xhr.setRequestHeader("X-CSRFToken", getCSRFToken());
            },
            success: function (data) {

                $('#editSectionId').val(data.id);
                // Populate modal form fields with fetched data
                $('#editSectionName').val(data.name);
                $('#editSubsectionsContainer').empty(); // Clear existing subsections

                // Iterate over each subsection in the data and append to modal
                for (var i = 0; i < data.subsections.length; i++) {
                    var subsection = data.subsections[i];
                    var subsectionHtml = '<div class="editSubSection">' +
                        '<div class="form-group row my-1">' +
                        '<label for="editSubsectionName" class="col-sm-3 col-form-label">Subsection Name:</label>' +
                        '<div class="col-sm-9">' +
                        '<input type="text" class="form-control" name="editSubsections[]" value="' + subsection.name + '" required>' +
                        '</div>' +
                        '</div>' +
                        '<div class="form-group row my-1">' +
                        '<label for="editSubsectionDescription" class="col-sm-3 col-form-label">Subsection Description:</label>' +
                        '<div class="col-sm-9">' +
                        '<textarea class="form-control" name="editDescriptions[]" required>' + subsection.description + '</textarea>' +
                        '</div>' +
                        '</div>' +
                        '<div class="form-group row my-1">' +
                        '<div class="col-sm-9 offset-sm-3">' +
                        '<button type="button" class="btn btn-danger editRemoveSubsection">Remove</button>' +
                        '</div>' +
                        '</div>' +
                        '</div>';
                    $('#editSubsectionsContainer').append(subsectionHtml);
                }

                // Show the modal
                $('#editSectionModal').modal('show');
            },
            error: function (xhr, status, error) {
                // Handle errors
                console.error('Error displaying section:', error);
            }
        });
    });


      // Add new subsection fields
      $("#editAddSubsection").click(function () {
        $("#editSubsectionsContainer").append('<div class="editSubSection">' +
            '<div class="form-group row my-1">' +
            '<label for="editSubsectionName" class="col-sm-3 col-form-label">Subsection Name:</label>' +
            '<div class="col-sm-9">' +
            '<input type="text" class="form-control" name="editSubsections[]" required>' +
            '</div>' +
            '</div>' +
            '<div class="form-group row my-1">' +
            '<label for="editSubsectionDescription" class="col-sm-3 col-form-label">Subsection Description:</label>' +
            '<div class="col-sm-9">' +
            '<textarea class="form-control" name="editDescriptions[]" required></textarea>' +
            '</div>' +
            '</div>' +
            '<div class="form-group row my-1">' +
            '<div class="col-sm-9 offset-sm-3">' +
            '<button type="button" class="btn btn-danger editRemoveSubsection">Remove</button>' +
            '</div>' +
            '</div>' +
            '</div>');
    });

    // Remove subsection
    $("#editSubsectionsContainer").on("click", ".editRemoveSubsection", function () {
        $(this).closest(".editSubSection").remove();
    });


    $('#editSectionForm').on('submit', function (e) {

        e.preventDefault();

        $.ajax({
            beforeSend: function (xhr, settings) {
                xhr.setRequestHeader("X-CSRFToken", getCSRFToken());
            },
            type: 'POST',
            url: 'section/edit_section/',
            data: $(this).serialize(),
            success: function (response) {
                $status = response["status"];
                if ($status == "success") {
                    $('#editSectionModal').modal('hide');
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
                alert("Failed to save Section and Subsections. Please try again.");
            }
        });
    });



});