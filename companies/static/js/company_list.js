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
    function deleteCompany(companyId, rowElement) {
        $.ajax({
            url: '/company/' + companyId + '/delete',
            type: 'DELETE',
            beforeSend: function (xhr, settings) {
                xhr.setRequestHeader("X-CSRFToken", getCSRFToken());
            },
            success: function (data) {
                // Handle success response
                $status = data["status"];
                if ($status == "success") {
                    $('#addCompanyModal').modal('hide');
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
    $.get("api/companies", function (data, response) {
        // Destroy existing DataTable
        $('#companies-table').DataTable().destroy();

        // Clear existing table rows
        $('#companies-table').find('tbody').empty();

        // Iterate over each item in the data and append rows to the table
        for (var i = 0; i < data.length; i++) {
            var line = '<tr class="' + data[i].id + '">' +
                '<td>' + data[i].name + '</td>' +
                '<td>' +
                '<a class="btn btn-primary btn-sm editbtn" href="#" data-company-id="' + data[i].id + '" style="margin-right:3px"><i class="fas fa-pen-to-square"></i></a>' +
                '<a class="btn btn-danger btn-sm delbtn" data-company-id="' + data[i].id + '"><i class="fas fa-trash"></i></a>' +
                '</td>' +
                '</tr>';

            $('#companies-table').find('tbody').append(line);
        }

        // Initialize DataTable with the updated table content
        $('#companies-table').DataTable({
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
        var companyId = $(this).data('company-id');

        // Get the row element containing the delete button
        var rowElement = $(this).closest('tr');

        // Call the deleteItem function with the item ID and row element
        deleteCompany(companyId, rowElement);
    });

    //Add item part
    $("#new_company").on("click", function () {
        $('#addCompanyModal').modal('show');
    })
    $('#addCompanyForm').on('submit', function (e) {

        e.preventDefault();
        var totalFormData = new FormData($(this)[0]);
        totalFormData.append('_method', 'post');

        $.ajax({
            beforeSend: function (xhr, settings) {
                xhr.setRequestHeader("X-CSRFToken", getCSRFToken());
            },
            type: 'POST',
            url: 'company/add_company/',
            processData: false,
            contentType: false,
            data: totalFormData,
            success: function (response) {
                // Handle success response (e.g., close modal, refresh data)

                $status = response["status"];
                if ($status == "success") {
                    $('#addCompanyModal').modal('hide');
                    // alert(response["message"]);
                    $('#toast-success').find('.toast-body').text(response["message"]);
                    $('#toast-success').toast('show');
                    location.reload(); // Reload the page to refresh the user list
                } else {
                    // alert(response["message"]);
                    $('#toast-error').find('.toast-body').text(response["message"]);
                    $('#toast-error').toast('show');
                }

            },
            error: function (xhr, status, error) {
                // Handle error response
                console.error(xhr.responseText);
            }
        });
    });

    //edit user part
    $(document).on('click', '.editbtn', function () {
        // Get the item ID from the button's data attribute
        var companyId = $(this).data('company-id');

        $.ajax({
            url: '/company/get_company_by_id/' + companyId + '/',
            type: 'GET',
            beforeSend: function (xhr, settings) {
                xhr.setRequestHeader("X-CSRFToken", getCSRFToken());
            },
            success: function (data) {
                // Handle success response
                $('#editCompanyId').val(data["id"]);
                $('#editCompanyName').val(data["name"]);
                $('#editCompanyModal').modal('show');
            },
            error: function (xhr, status, error) {
                // Handle errors
                console.error('Error displaying company:', error);
            }
        });
    });


    $('#editCompanyForm').on('submit', function (e) {

        e.preventDefault();
        var totalFormData = new FormData($(this)[0]);

        $.ajax({
            beforeSend: function (xhr, settings) {
                xhr.setRequestHeader("X-CSRFToken", getCSRFToken());
            },
            type: 'POST',
            url: 'company/edit_company/',
            processData: false,
            contentType: false,
            data: totalFormData,
            success: function (response) {
                $status = response["status"];
                if ($status == "success") {
                    $('#editCompanyModal').modal('hide');
                    $('#toast-success').find('.toast-body').text(response["message"]);
                    $('#toast-success').toast('show');
                    location.reload(); // Reload the page to refresh the user list
                } else {
                    $('#toast-error').find('.toast-body').text(response["message"]);
                    $('#toast-error').toast('show');
                }
            },
            error: function (xhr, status, error) {
                // Handle error response
                console.error(xhr.responseText);
            }
        });
    });

});