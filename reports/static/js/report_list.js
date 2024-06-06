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
    function deleteReport(reportId, rowElement) {
        $.ajax({
            url: '/report/' + reportId + '/delete',
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

    // Event listener for delete buttons
    $(document).on('click', '.delbtn', function () {
        // Get the report ID from the button's data attribute
        var reportId = $(this).data('report-id');

        // Get the row element containing the delete button
        var rowElement = $(this).closest('tr');

        // Call the deleteItem function with the item ID and row element
        deleteReport(reportId, rowElement);
    });

    // AJAX request to fetch reports data
    $.get("api/reports", function (data, response) {
        // Destroy existing DataTable
        $('#reports-table').DataTable().destroy();

        // Clear existing table rows
        $('#reports-table').find('tbody').empty();

        // Iterate over each report in the data and append rows to the table
        for (var i = 0; i < data.length; i++) {
            var line = '<tr class="' + data[i].id + '">' +
                '<td>' + data[i].company_name + '</td>' +
                '<td>' + data[i].repository_name + '</td>' +
                '<td>' + '<a class="report_file" href="#" data-report-id="' + data[i].id + '"><i class="far fa-file-pdf fa-2xl"></i></a>' + '</td>' +
                '<td>' +
                '<a class="btn btn-primary btn-sm editbtn" href="#" data-report-id="' + data[i].id + '" style="margin-right:3px"><i class="fas fa-pen-to-square"></i></a>' +
                '<a class="btn btn-danger btn-sm delbtn" data-report-id="' + data[i].id + '"><i class="fas fa-trash"></i></a>' +
                '</td>' +
                '</tr>';

            $('#reports-table').find('tbody').append(line);
        }

        // Initialize DataTable with the updated table content
        $('#reports-table').DataTable({
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
                'targets': [2,3], // column index (start from 0)
                'orderable': false, // set orderable false for selected columns
            }],
            "rowCallback": function (row, data, index) {
                $('td', row).css('background-color', 'white');
            }
        });
    });

    // Add section part
    $("#new_report").on("click", function () {
        // Fetch companies data
        $.ajax({
            url: 'api/companies/',
            type: 'GET',
            success: function (data) {
                // Populate company select options
                var companySelect = $('#companySelect');
                companySelect.empty(); // Clear existing options
                // Add selected disabled option
                companySelect.append($('<option>', {
                    value: '',
                    text: 'Select Company',
                    selected: true,
                    disabled: true
                }));
                $.each(data, function (index, company) {
                    companySelect.append($('<option>', {
                        value: company.id,
                        text: company.name
                    }));
                });
            },
            error: function (xhr, status, error) {
                console.error('Error fetching companies:', error);
            }
        });

        // Fetch repositories data
        $.ajax({
            url: 'api/repositories/',
            type: 'GET',
            success: function (data) {
                // Populate repository select options
                var repositorySelect = $('#repositorySelect');
                repositorySelect.empty(); // Clear existing options
                // Add selected disabled option
                repositorySelect.append($('<option>', {
                    value: '',
                    text: 'Select Repository',
                    selected: true,
                    disabled: true
                }));
                $.each(data, function (index, repository) {
                    repositorySelect.append($('<option>', {
                        value: repository.id,
                        text: repository.name
                    }));
                });
            },
            error: function (xhr, status, error) {
                console.error('Error fetching repositories:', error);
            }
        });

        $('#addReportModal').modal('show');
    });

    // Event listener for repository select change
    $('#repositorySelect').change(function () {
        var repositoryId = $(this).val(); // Get the selected repository ID

        // Fetch sections for the selected repository
        $.ajax({
            url: 'repository/get_repository_sections/' + repositoryId + '/', // Adjust the URL based on your Django API endpoint
            type: 'GET',
            success: function (data) {
                // Clear existing section tables
                $('#sectionTablesContainer').empty();

                // Iterate over sections and generate tables
                $.each(data, function (index, section) {
                    // Create a table for each section
                    var table = $('<table>').addClass('table table-bordered');
                    var tableHead = $('<thead>').append($('<tr>').append($('<th>').text(section.id),$('<th>').text(section.name), $('<th>').text('Status'), $('<th>').text('Justification')));
                    var tableBody = $('<tbody>');
                    var count = 1;

                    // Populate the table body with subsections
                    $.each(section.subsections, function (subIndex, subsection) {
                        var subsectionId = section.id + '-' + count;
                        count++;
                        var row = $('<tr>').append($('<td>').text(subsectionId),$('<td>').text(subsection.name), $('<td>').append($('<select>').addClass('form-control').attr('name', 'subsection_status_' + subsection.id).append($('<option>').text('Applicable').val('applicable'), $('<option>').text('Not Applicable').val('not_applicable'))), $('<td>').append($('<textarea>').addClass('form-control').attr('name', 'subsection_justif_' + subsection.id)));
                        tableBody.append(row);
                    });

                    // Append table head and body to the table
                    table.append(tableHead, tableBody);

                    // Append the table to the container
                    $('#sectionTablesContainer').append(table);
                });
            },
            error: function (xhr, status, error) {
                console.error('Error fetching sections:', error);
            }
        });
    });

    // Event listener for form submission
    $('#addReportForm').submit(function (event) {
        event.preventDefault(); // Prevent default form submission

        // Serialize form data
        var formData = $(this).serialize();

        console.log(formData);

        // Submit form data using AJAX
        $.ajax({
            beforeSend: function (xhr, settings) {
                xhr.setRequestHeader("X-CSRFToken", getCSRFToken());
            },
            url: 'report/add_report/',
            type: 'POST',
            data: formData,
            success: function (response) {
                $status = response["status"];
                if ($status == "success") {
                    $('#addReportModal').modal('hide');
                    $('#toast-success').find('.toast-body').text(response["message"]);
                    $('#toast-success').toast('show');
                    location.reload(); // Reload the page to refresh the report list
                } else {
                    // Display error message
                    $('#toast-error').find('.toast-body').text(response["message"]);
                    $('#toast-error').toast('show');
                }
            },
            error: function (xhr, status, error) {
                // Handle error response
                console.error('Error submitting form:', error);
            }
        });
    });


    // Event listener for edit buttons
    $(document).on('click', '.editbtn', function () {
    var reportId = $(this).data('report-id');

    // AJAX request to fetch report details and associated sections
    $.ajax({
        url: '/report/get_report_by_id/' + reportId + '/',
        type: 'GET',
        beforeSend: function (xhr, settings) {
            xhr.setRequestHeader("X-CSRFToken", getCSRFToken());
        },
        success: function (data) {
            $('#editReportId').val(data.report_data.id);
            $('#editCompany').val(data.report_data.company_name);
            $('#editRepository').val(data.report_data.repository_name);
            $('#editSectionTablesContainer').empty(); // Clear existing sections

            // Store unique sections
            var uniqueSections = {};
            $.each(data.subsection_status_data, function (index, subsection_status) {
                uniqueSections[subsection_status.section_id] = subsection_status.section_name;
            });

            // Iterate over unique sections to build tables
            $.each(uniqueSections, function (sectionId, sectionName) {
                var table = "<table class='table table-bordered'><thead><tr><th>" + sectionId + "</th><th>" + sectionName + "</th><th>Status</th><th>Justification</th></tr></thead><tbody>";

                var subsections = data.subsection_status_data;
                var count = 1;
                for (var j = 0; j < subsections.length; j++) {
                    if (subsections[j].section_name === sectionName) {
                        var subsectionId = sectionId + '-' + count;
                        count++;
                        var selectedApplicable = subsections[j].status === 'applicable' ? 'selected' : '';
                        var selectedNotApplicable = subsections[j].status === 'not_applicable' ? 'selected' : '';
                        var selectOptions = '<option value="applicable" ' + selectedApplicable + '>Applicable</option>' +
                            '<option value="not_applicable" ' + selectedNotApplicable + '>Not Applicable</option>';
                        var select = '<select class="form-control" name="subsection_status_' + subsections[j].subsection_id + '">' + selectOptions + '</select>';
                        var textarea = '<textarea class="form-control" name="subsection_justif_' + subsections[j].subsection_id + '">' + subsections[j].justification + '</textarea>';
                        var row = "<tr><td>" + subsectionId + "</td><td>" + subsections[j].subsection_name + "</td><td>" + select + "</td><td>" + textarea + "</td></tr>";
                        table += row;
                    }
                }

                table += "</tbody></table>";
                $('#editSectionTablesContainer').append(table);
            });

            // Show the modal
            $('#editReportModal').modal('show');
        },
        error: function (xhr, status, error) {
            console.error('Error displaying repository:', error);
        }
    });
});


    // Event listener for form submission
    $('#editReportForm').submit(function (event) {
        event.preventDefault(); // Prevent default form submission

        // AJAX request to submit the edited report data
        $.ajax({
            beforeSend: function (xhr, settings) {
                xhr.setRequestHeader("X-CSRFToken", getCSRFToken());
            },
            type: 'POST',
            url: '/report/edit_report/', // URL for submitting the edited report data
            data: $(this).serialize(), // Serialize form data
            success: function (response) {
                $status = response["status"];
                if ($status == "success") {
                    $('#editReportModal').modal('hide');
                    $('#toast-success').find('.toast-body').text(response["message"]);
                    $('#toast-success').toast('show');
                    location.reload(); // Reload the page to refresh the report list
                } else {
                    // Display error message
                    $('#toast-error').find('.toast-body').text(response["message"]);
                    $('#toast-error').toast('show');
                }
            },
            error: function (xhr, errmsg, err) {
                console.log(xhr.status + ": " + xhr.responseText); // Log any errors
                alert("Failed to save edited report. Please try again.");
            }
        });
    });



    $(document).on('click', '.report_file', function () {
        var reportId = $(this).data('report-id');
        $('#downloadReportId').val(reportId);
        $("#downloadReportFileName").val("");
        $("#exportReportFile_modal").modal("show");
    });

    $("#export_report_btn").on("click",function(){
        $("#exportReportFile_modal").modal("hide");
    })



});
