const getImageDescription = async (image: Base64URLString): Promise<string> => {
    const response = await fetch('localhost:8000/chat/description', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image }),
    });
    const json = await response.json();
    return json.explanation;
};
