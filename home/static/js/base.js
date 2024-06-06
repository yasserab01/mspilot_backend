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

    // When file input changes display picture
    $('#pictureInput').on('change', function () {
        var inputFile = $(this)[0].files[0];
        var reader = new FileReader();

        reader.onload = function (e) {
            $('#selectedImage').attr('src', e.target.result).show();
        }

        reader.readAsDataURL(inputFile);
    });

    ///upload picture
    $('#uploadButton').click(function () {
        var formData = new FormData();
        formData.append('picture', $('#pictureInput')[0].files[0]);

        $.ajax({
            beforeSend: function (xhr, settings) {
                xhr.setRequestHeader("X-CSRFToken", getCSRFToken());
            },
            url: 'user/upload_picture/',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function (response) {
                // $('#uploadStatus').text('Upload successful');
                //update picture
                $('#profilePicture').attr('src', response["imageUrl"]);
                // Optionally, close the modal or perform other actions upon successful upload
                $("#uploadModal").modal("hide");
                $("#pictureInput").val(null);
                $("#selectedImage").attr('src', "#").hide();
                $('#toast-success').find('.toast-body').text("Image uploaded successfully");
                $('#toast-success').toast('show');
            },
            error: function (xhr, status, error) {
                $('#uploadStatus').text('Upload failed: ' + xhr.responseJSON.message);
            }
        });
    });

    // edit user password
    $('#editUserPwdForm').on('submit',function(e){
        e.preventDefault();
        var new_pwd_1 = $("#new_pwd_1").val();
        var new_pwd_2 = $("#new_pwd_2").val();

        if( new_pwd_1 == new_pwd_2){

         $.ajax({
            beforeSend: function (xhr, settings) {
                xhr.setRequestHeader("X-CSRFToken", getCSRFToken());
            },
            type: 'POST',
            url: 'user/edit_password/', // URL for submitting the edited report data
            data: $(this).serialize(), // Serialize form data
             success: function (response) {
                $status = response["status"];
                if ($status == "success") {
                    $('#editUserPwdModal').modal('hide');
                    $('#toast-success').find('.toast-body').text(response["message"]);
                    $('#toast-success').toast('show');
                } else {
                    // Display error message
                    $('#toast-error').find('.toast-body').text(response["message"]);
                    $('#toast-error').toast('show');
                }
            },
            error: function (xhr, errmsg, err) {
                console.log(xhr.status + ": " + xhr.responseText); // Log any errors
                alert("Failed to edit password. Please try again.");
            }
         });
        }else{
            // Display error message
            $('#toast-error').find('.toast-body').text("New password fields do not match");
            $('#toast-error').toast('show');
        }
       
    });

});