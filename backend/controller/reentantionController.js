const jwt = require("jsonwebtoken");
const churnguard_con = require("../config/db");
const transporter = require("../config/malier");
const axios = require("axios");
const genremap = require("../config/genremap");

async function getMovies() {

    try {

        const [data1, data2, data3, data4, data5] = await Promise.all([

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
            ),
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
                    Special recommendations picked just for you
                </p>

            </div>

            <!-- BODY -->
            <div style="padding:30px;">

                <h2>
                    Hi Movie Lover 👋
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

                                ${m.poster_path
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

exports.sendEmail = async (req, res) => {
    const { email, html } = req.body

    try {
        const info = await transporter.sendMail({
            from: '"Your App"',
            to: email,
            subject: "🎬 Rekomendasi Spesial Untuk Kamu!",
            html: html
        });

        res.status(200).json({
            message: "Berhasil  dikirm customer"
        });

        console.log("Email terkirim:", info.messageId);
    } catch (error) {
        console.error("Gagal kirim email:", error);
    }
}

async function sendRetentionEmail({
    customer,
    promo_name,
    promo_discount,
    expired_date,
    risk,
    segment,
    prediction_id
}) {
    try {

        const genreId =
            genremap[
            customer.GenrePreference
                ?.toLowerCase()
                ?.replace(/\s/g, "_")
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
            email: customer.email,
            movies: recommendedMovies,
            promo_name,
            promo_discount,
            expired_date,
            recommendation,
            genre: customer.GenrePreference,
            risk,
            segment
        });

        await transporter.sendMail({
            from: '"ChurnGuard"',
            to: customer.email,
            subject: "🎬 Rekomendasi Spesial Untuk Kamu!",
            html
        });


        await churnguard_con.query(
            `UPDATE prediction_detail
             SET email_sent = ?,
                 email_sent_at = NOW()
             WHERE email = ?
             AND prediction_id = ?
             AND CustomerID = ?`,
            [
                html,
                customer.email,
                prediction_id,
                customer.CustomerID
            ]
        );

    } catch (err) {
        console.error("sendRetentionEmail error:", err.message);
    }
}

exports.bulkSend = async (req, res) => {
    const {
        promo_ALL_R_H_S,
        promo_ALL_R_H_S_value,
        promo_ALL_R_H_S_expired,

        promo_H_M_R_L_S,
        promo_H_M_R_L_S_value,
        promo_H_M_R_L_S_expired,

        promo_M_H_R_M_S,
        promo_M_H_R_M_S_value,
        promo_M_H_R_M_S_expired,

        promo_L_R_M_L_S,
        promo_L_R_M_L_S_value,
        promo_L_R_M_L_S_expired
    } = req.body;
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                message: "No token provided"
            });
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const email = decoded.email;

        const promoList = [
            
            {
                name: promo_ALL_R_H_S,
                value: promo_ALL_R_H_S_value,
                expired: promo_ALL_R_H_S_expired,
                risk: "High-Medium-Low",
                segment: "Basic Frustrated user"
            },

            {
                name: promo_H_M_R_L_S,
                value: promo_H_M_R_L_S_value,
                expired: promo_H_M_R_L_S_expired,
                risk: "High-Medium",
                segment: "Experienced user"
            },

            {
                name: promo_M_H_R_M_S,
                value: promo_M_H_R_M_S_value,
                expired: promo_M_H_R_M_S_expired,
                risk: "Medium-High",
                segment: "Basic user"
            },

            {
                name: promo_L_R_M_L_S,
                value: promo_L_R_M_L_S_value,
                expired: promo_L_R_M_L_S_expired,
                risk: "Low",
                segment: "Basic user-Experienced user"
            }

        ];

        const [rows] = await churnguard_con.query(
            `SELECT prediction_id 
             FROM prediction_list 
             WHERE user_email = ?
             AND status = "active"`
             ,
            [email]
        );

        if (!rows || rows.length === 0) {
            return res.status(404).json({
                message: "Prediction ID not found"
            });
        }

        const prediction_id = rows[0].prediction_id;

        for (const promo of promoList) {

            if (!promo.name) continue;

            console.log("Processing promo:", promo.name);

            const [customerRows] = await churnguard_con.query(
                `SELECT email, GenrePreference, CustomerID
                 FROM prediction_detail
                 WHERE Risk IN ("Low", "Medium", "High")
                 AND Segment = ?
                 AND email_sent IS NULL
                 AND email_sent_at IS NULL
                 AND prediction_id = ?`,
                [
                    promo.segment,
                    prediction_id
                ]
            );
            console.log(`Found customers for ${promo.name}:`, customerRows.length);
            console.log(prediction_id)

            if (!customerRows || customerRows.length === 0) {
                continue;
            }
            for (const customer of customerRows) {
                try {
                    console.log("Sending email to:", customer.email);

                    await sendRetentionEmail({
                        customer,
                        promo_name: promo.name,
                        promo_discount: promo.value,
                        expired_date: promo.expired,
                        risk: promo.risk,
                        segment: promo.segment,
                        prediction_id
                    });

                } catch (emailErr) {
                    console.error("Email failed for:", customer.email, emailErr.message);
                }
            }
        }

        return res.status(200).json({
            message: "Bulk email trigger finished"
        });

    } catch (err) {
        console.error("bulkSend error:", err);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

exports.getEmailSent = async (req,res) => {
    
}