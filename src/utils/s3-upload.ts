import { gql, ApolloClient } from '@apollo/client';

const GET_IMAGE_UPLOAD_URL = gql`
  mutation GetImageUploadUrl($carId: String!, $fileName: String!) {
    getImageUploadUrl(carId: $carId, fileName: $fileName) {
      uploadUrl
      key
    }
  }
`;

export interface S3UploadResult {
  s3Key: string;
  fileName: string;
}

interface PresignedUpload {
  uploadUrl: string;
  key: string;
}

interface GetImageUploadUrlData {
  getImageUploadUrl: PresignedUpload;
}

interface GetAvatarUploadUrlData {
  getAvatarUploadUrl: PresignedUpload;
}

interface ProcessAvatarData {
  processAvatar: string;
}

export async function uploadImageToS3(
  uri: string,
  carId: string,
  client: ApolloClient,
  onProgress?: (progress: number) => void,
): Promise<S3UploadResult> {
  const fileName = uri.split('/').pop() || 'photo.jpg';

  // 1. Get presigned URL from backend
  const { data } = await client.mutate<GetImageUploadUrlData>({
    mutation: GET_IMAGE_UPLOAD_URL,
    variables: { carId, fileName },
  });
  if (!data?.getImageUploadUrl) {
    throw new Error('Failed to get an upload URL from the server');
  }
  const { uploadUrl, key } = data.getImageUploadUrl;

  // 2. Read image from device URI
  const response = await fetch(uri);
  const blob = await response.blob();

  // 3. Upload directly to S3 via presigned PUT with progress tracking
  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress?.(e.loaded / e.total);
    };
    xhr.onload = () => {
      if (xhr.status < 400) {
        resolve();
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    };
    xhr.onerror = () => reject(new Error('Network error during upload'));
    xhr.ontimeout = () => reject(new Error('Upload timed out'));
    xhr.timeout = 60000;
    xhr.open('PUT', uploadUrl);
    xhr.setRequestHeader('Content-Type', blob.type || 'image/jpeg');
    xhr.send(blob);
  });

  return { s3Key: key, fileName };
}

const GET_AVATAR_UPLOAD_URL = gql`
  mutation GetAvatarUploadUrl($fileName: String!) {
    getAvatarUploadUrl(fileName: $fileName) {
      uploadUrl
      key
    }
  }
`;

const PROCESS_AVATAR = gql`
  mutation ProcessAvatar($s3Key: String!) {
    processAvatar(s3Key: $s3Key)
  }
`;

export async function uploadAvatar(
  uri: string,
  client: ApolloClient,
): Promise<string> {
  const fileName = uri.split('/').pop() || 'avatar.jpg';

  // 1. Get presigned URL
  const { data } = await client.mutate<GetAvatarUploadUrlData>({
    mutation: GET_AVATAR_UPLOAD_URL,
    variables: { fileName },
  });
  if (!data?.getAvatarUploadUrl) {
    throw new Error('Failed to get an avatar upload URL from the server');
  }
  const { uploadUrl, key } = data.getAvatarUploadUrl;

  // 2. Upload to S3
  const response = await fetch(uri);
  const blob = await response.blob();
  const uploadResponse = await fetch(uploadUrl, {
    method: 'PUT',
    body: blob,
    headers: { 'Content-Type': blob.type || 'image/jpeg' },
  });
  if (!uploadResponse.ok) {
    throw new Error(`Avatar upload failed with status ${uploadResponse.status}`);
  }

  // 3. Process avatar on backend and get final URL
  const { data: processData } = await client.mutate<ProcessAvatarData>({
    mutation: PROCESS_AVATAR,
    variables: { s3Key: key },
  });
  if (!processData?.processAvatar) {
    throw new Error('Avatar processing failed on the server');
  }
  return processData.processAvatar;
}
