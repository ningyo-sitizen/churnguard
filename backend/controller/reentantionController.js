const jwt = require("jsonwebtoken");
const churnguard_con = require("../config/db");
const axios = require("axios");
const genremap = require("../config/genremap");

async function getMovies() {

    try {

        const [data1, data2] = await Promise.all([

            axios.get(
                "https://api.themoviedb.org/3/movie/popular",
                {
                    params: {
                        api_key: process.env.TMDB_API_KEY,
                        page: 1
                    }
                }
            ),

            axios.get(
                "https://api.themoviedb.org/3/movie/popular",
                {
                    params: {
                        api_key: process.env.TMDB_API_KEY,
                        page: 2
                    }
                }
            )

        ]);

        const allMovies = [
            ...data1.data.results,
            ...data2.data.results
        ];

        return allMovies;

    } catch (err) {

        console.error(
            "TMDB ERROR:",
            err.response?.data || err.message
        );

        return [];
    }
}

function getRecommendedMovies(movies, genreId) {

    let filtered = movies;

    if (genreId) {

        filtered = movies.filter(
            (m) =>
                m.genre_ids &&
                m.genre_ids.includes(genreId)
        );
    }

    if (filtered.length === 0) {
        filtered = movies;
    }

    return filtered
        .sort((a, b) => {

            const scoreA =
                (a.vote_average || 0) * 2 +
                (a.popularity || 0);

            const scoreB =
                (b.vote_average || 0) * 2 +
                (b.popularity || 0);

            return scoreB - scoreA;

        })
        .slice(0, 6);
}

function getRetentionRecommendation(risk, segment) {

    if (risk === "High") {

        if (segment === "Basic Frustrated User") {
            return "Kami memberikan promo spesial dan rekomendasi film terbaik agar pengalaman streaming kamu menjadi lebih menyenangkan.";
        }

        if (segment === "Basic User") {
            return "Nikmati promo spesial dan film populer pilihan khusus untuk kamu.";
        }

        return "Dapatkan loyalty reward dan rekomendasi premium content pilihan.";
    }

    if (risk === "Medium") {

        if (segment === "Basic Frustrated User") {
            return "Kami menyiapkan rekomendasi film baru untuk meningkatkan pengalaman menonton kamu.";
        }

        if (segment === "Basic User") {
            return "Temukan film trending terbaru sesuai genre favorit kamu.";
        }

        return "Nikmati rekomendasi premium content dan personalized movie.";
    }

    return "Terima kasih telah menjadi customer setia kami ❤️";
}

function generateHTML({
    email,
    movies,
    promo_name,
    promo_discount,
    expired_date,
    recommendation,
    genre,
    risk,
    segment
}) {

    return `
    
    <div style="
        font-family: Arial, sans-serif;
        background:#f1f5f9;
        padding:30px;
    ">

        <div style="
            max-width:700px;
            margin:auto;
            background:white;
            border-radius:16px;
            overflow:hidden;
            box-shadow:0 4px 20px rgba(0,0,0,0.1);
        ">

            <!-- HEADER -->
            <div style="
                background:linear-gradient(135deg,#2563eb,#7c3aed);
                color:white;
                padding:30px;
                text-align:center;
            ">

                <h1 style="margin:0;">
                    🎬 ChurnGuard Recommendation
                </h1>

                <p style="margin-top:10px;">
                    Personalized retention campaign for you
                </p>

            </div>

            <!-- BODY -->
            <div style="padding:30px;">

                <h2>
                    Hi ${email || "Customer"} 👋
                </h2>

                <p style="
                    color:#475569;
                    line-height:1.8;
                    font-size:15px;
                ">
                    ${recommendation}
                </p>

                <!-- PROMO -->
                <div style="
                    margin-top:25px;
                    background:#dcfce7;
                    border:1px solid #22c55e;
                    border-radius:12px;
                    padding:20px;
                ">

                    <h2 style="
                        margin-top:0;
                        color:#166534;
                    ">
                        🎁 ${promo_name}
                    </h2>

                    <p style="
                        font-size:18px;
                        font-weight:bold;
                        color:#15803d;
                    ">
                        Discount ${promo_discount}%
                    </p>

                    <p style="color:#166534;">
                        Promo berlaku sampai:
                        <b>${expired_date}</b>
                    </p>

                </div>

                <!-- MOVIES -->
                <h2 style="
                    margin-top:35px;
                    margin-bottom:20px;
                ">
                    🍿 Recommended Movies
                </h2>

                <table width="100%" cellspacing="10">

                    <tr>

                        ${movies.map((m) => `

                            <td
                                style="
                                    width:33%;
                                    background:#f8fafc;
                                    border-radius:12px;
                                    padding:10px;
                                    vertical-align:top;
                                    text-align:center;
                                "
                            >

                                ${
                                    m.poster_path
                                    ? `
                                        <img
                                            src="https://image.tmdb.org/t/p/w300${m.poster_path}"
                                            style="
                                                width:100%;
                                                border-radius:10px;
                                            "
                                        />
                                    `
                                    : `
                                        <div style="
                                            height:220px;
                                            background:#cbd5e1;
                                            border-radius:10px;
                                        "></div>
                                    `
                                }

                                <h3 style="
                                    font-size:14px;
                                    margin-top:10px;
                                    min-height:40px;
                                ">
                                    ${m.title}
                                </h3>

                                <p style="
                                    color:#f59e0b;
                                    font-weight:bold;
                                ">
                                    ⭐ ${m.vote_average}
                                </p>

                                <a
                                    href="https://www.themoviedb.org/movie/${m.id}"
                                    style="
                                        display:inline-block;
                                        margin-top:8px;
                                        background:#2563eb;
                                        color:white;
                                        text-decoration:none;
                                        padding:8px 14px;
                                        border-radius:8px;
                                        font-size:13px;
                                        font-weight:bold;
                                    "
                                >
                                    Watch Now
                                </a>

                            </td>

                        `).join("")}

                    </tr>

                </table>

                <!-- CTA -->
                <div style="
                    text-align:center;
                    margin-top:40px;
                ">

                    <a
                        href="https://your-app.com"
                        style="
                            display:inline-block;
                            background:#7c3aed;
                            color:white;
                            padding:14px 28px;
                            border-radius:12px;
                            text-decoration:none;
                            font-weight:bold;
                            font-size:16px;
                        "
                    >
                        🚀 Continue Watching
                    </a>

                </div>

                <!-- FOOTER -->
                <div style="
                    margin-top:40px;
                    text-align:center;
                    color:#94a3b8;
                    font-size:12px;
                ">

                    <p>
                        You received this email because you are registered on ChurnGuard CRM.
                    </p>

                </div>

            </div>

        </div>

    </div>

    `;
}

exports.getGeneratedEmail = async (req, res) => {

    try {

        const {
            promo_name,
            promo_discount,
            expired_date,
            risk,
            segment,
            genre,
            email
        } = req.body;

        const genreId =
            genremap[
                genre?.toLowerCase()?.replace(/\s/g, "_")
            ];

        const movies = await getMovies();

        const recommendedMovies =
            getRecommendedMovies(
                movies,
                genreId
            );

        const recommendation =
            getRetentionRecommendation(
                risk,
                segment
            );

        const html = generateHTML({
            email,
            movies: recommendedMovies,
            promo_name,
            promo_discount,
            expired_date,
            recommendation,
            genre,
            risk,
            segment
        });

        return res.status(200).json({
            success: true,
            html
        });

    } catch (err) {

        console.log(err);

        return res.status(500).json({
            success: false,
            message: "Failed generate retention email"
        });
    }
};