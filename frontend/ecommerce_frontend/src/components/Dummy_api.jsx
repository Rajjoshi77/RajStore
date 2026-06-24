import React, { useState, useEffect } from 'react'
import axios from 'axios';
const Dummy_api = () => {
    const [data, setData] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get('https://jsonplaceholder.typicode.com/posts')
            .then(response => {
                if (Array.isArray(response.data)) {
                    setData(response.data);
                } else {
                    setError('Unexpected API response format.');
                }
            })
            .catch(error => {
                console.error('API request failed:', error);
                setError('Failed to load dummy data. Please try again later.');
            })
            .finally(() => setLoading(false));
    }, [])

    if (loading) {
        return <div>Loading dummy data...</div>
    }

    if (error) {
        return <div>{error}</div>
    }

    return (
        <div>
            {data.slice(0, 5).map(post => (
                <div key={post.id}>
                    <h3>{post.title}</h3>
                    <p>{post.body}</p>
                </div>
            ))}
        </div>
    )
}

export default Dummy_api;