exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };
  
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }
  
  try {
    const { text, speaker = 'nara' } = JSON.parse(event.body);
    
    // URL 인코딩
    const params = new URLSearchParams({
      speaker: speaker,
      text: text,
      volume: '0',
      speed: '0',
      pitch: '0',
      format: 'mp3'
    });
    
    // 네이버 CLOVA Voice API 호출
    const response = await fetch('https://naveropenapi.apigw.ntruss.com/tts-premium/v1/tts', {
      method: 'POST',
      headers: {
        'X-NCP-APIGW-API-KEY-ID': process.env.CLOVA_CLIENT_ID,
        'X-NCP-APIGW-API-KEY': process.env.CLOVA_CLIENT_SECRET,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('CLOVA API error:', response.status, errorText);
      throw new Error(`CLOVA API error: ${response.status}`);
    }
    
    const audioBuffer = await response.arrayBuffer();
    
    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': 'audio/mpeg',
      },
      body: Buffer.from(audioBuffer).toString('base64'),
      isBase64Encoded: true
    };
    
  } catch (error) {
    console.error('CLOVA TTS Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
