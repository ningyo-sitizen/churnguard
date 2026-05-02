import axios from "axios";
import { useAuth } from "../utils/auth";
import { useState } from "react";

export default function Prediction() {
    const user = useAuth();

    const [file, setFile] = useState(null);
    const [headerError, setHeaderError] = useState(null);
    const [missingData, setMissingData] = useState([]);
    const [totalError, setTotalError] = useState(0);
    const [columnSummary, setColumnSummary] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasChecked, setHasChecked] = useState(false);
    const [showNext, setshowNext] = useState(false);

    const [openDetail, setOpenDetail] = useState({
        header: false,
        missing: false,
        status: false
    });

    if (!user) return <p>Loading...</p>;

    const toggle = (key) => {
        setOpenDetail({
            header: false,
            missing: false,
            status: false,
            [key]: !openDetail[key]
        });
    };

    const handleUpload = async () => {
        if (!file) return alert("Pilih file dulu");

        try {
            setLoading(true);

            const formData = new FormData();
            formData.append("file", file);

            const token = localStorage.getItem("token");

            const res = await axios.post(
                "http://localhost:5000/csv/upload-csv",
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setHeaderError(res.data.headerError);
            setMissingData(res.data.missingData || []);
            setTotalError(res.data.totalError || 0);
            setColumnSummary(res.data.columnSummary || []);
            setHasChecked(true);

            if (res.data.headerError === null && res.data.missingData.length === 0) {
                console.log("benar");
                setshowNext(true)
                console.log(file)
            }
            if (res.data.headerError) {
                console.log("salah karena header")
            }
            if (res.data.missingData?.length > 0) {
                console.log("salah karena missing data")
            }

        } catch (err) {
            console.log("Upload error:", err);
        } finally {
            setLoading(false);
        }
    };

    const isValid =
        hasChecked && !headerError && missingData.length === 0;

    const grouped = missingData.reduce((acc, curr) => {
        if (!acc[curr.row]) acc[curr.row] = [];
        acc[curr.row].push(curr.column);
        return acc;
    }, {});

    return (
        <div style={container}>
            <h2>Upload CSV</h2>

            {!hasChecked && (
                <div style={uploadBox}>
                    <input
                        type="file"
                        accept=".csv"
                        onChange={(e) => setFile(e.target.files[0])}
                    />

                    <button onClick={handleUpload} disabled={loading}>
                        {loading ? "Processing..." : "Upload & Validate"}
                    </button>
                </div>
            )}
            <div>
                {showNext && (
                <div>
                    <button onClick={"hello"}>
                        next
                    </button>
                </div>
            )}
            </div>

            {hasChecked && (
                <>
                    <div style={cardGrid}>

                        <div style={cardError}>
                            <h3>Header</h3>

                            {!headerError ? (
                                <p>✅ Valid</p>
                            ) : (
                                <p>❌ Error ditemukan</p>
                            )}

                            <button onClick={() => toggle("header")}>
                                {openDetail.header ? "Tutup" : "Lihat Detail"}
                            </button>

                            {openDetail.header && headerError && (
                                <pre style={detailBox}>
                                    {JSON.stringify(headerError, null, 2)}
                                </pre>
                            )}
                        </div>

                        <div style={cardWarning}>
                            <h3>Missing Data</h3>

                            {missingData.length === 0 ? (
                                <p>✅ Tidak ada missing</p>
                            ) : (
                                <p>{totalError} error ditemukan</p>
                            )}

                            <button onClick={() => toggle("missing")}>
                                {openDetail.missing ? "Tutup" : "Lihat Detail"}
                            </button>

                            {openDetail.missing && missingData.length > 0 && (
                                <div style={detailBox}>
                                    {Object.entries(grouped).map(([row, cols]) => (
                                        <div key={row}>
                                            <strong>Row {row}</strong>
                                            <ul>
                                                {cols.map((c, i) => (
                                                    <li key={i}>{c}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div style={isValid ? cardSuccess : cardNeutral}>
                            <h3>Status</h3>

                            {isValid ? (
                                <p>✅ Data siap diproses</p>
                            ) : (
                                <p>⚠ Perlu diperbaiki</p>
                            )}

                            <button onClick={() => toggle("status")}>
                                {openDetail.status ? "Tutup" : "Lihat Detail"}
                            </button>

                            {openDetail.status && (
                                <div style={detailBox}>
                                    {isValid
                                        ? "Semua validasi lolos"
                                        : "Masih ada error pada header atau data"}
                                </div>
                            )}
                        </div>
                    </div>

                    {columnSummary.length > 0 && (
                        <div style={tableWrapper}>
                            <h3>Column Summary</h3>

                            <table style={table}>
                                <thead>
                                    <tr>
                                        <th>Column</th>
                                        <th>Type</th>
                                        <th>Unique</th>
                                        <th>Sample</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {columnSummary.map((col, i) => (
                                        <tr key={i}>
                                            <td>{col.column}</td>
                                            <td>{col.type}</td>
                                            <td>{col.uniqueCount}</td>
                                            <td>{col.sample.join(", ")}</td>
                                            <td>{col.status}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <button
                        style={{ marginTop: 20 }}
                        onClick={() => {
                            setHasChecked(false);
                            setFile(null);
                            setHeaderError(null);
                            setMissingData([]);
                            setTotalError(0);
                            setColumnSummary([]);
                            setOpenDetail({
                                header: false,
                                missing: false,
                                status: false
                            });
                        }}
                    >
                        Upload File Baru
                    </button>
                </>
            )}
        </div>
    );
}


const container = {
    padding: 24,
    fontFamily: "Inter, sans-serif"
};

const uploadBox = {
    padding: 20,
    border: "1px dashed #aaa",
    borderRadius: 10,
    marginBottom: 20
};

const cardGrid = {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 16,
    marginBottom: 20
};

const baseCard = {
    padding: 16,
    borderRadius: 10,
    minHeight: 140
};

const cardError = {
    ...baseCard,
    background: "#ffe5e5",
    border: "1px solid #ff4d4d"
};

const cardWarning = {
    ...baseCard,
    background: "#fff8e1",
    border: "1px solid #ffc107"
};

const cardSuccess = {
    ...baseCard,
    background: "#e6ffed",
    border: "1px solid #28a745"
};

const cardNeutral = {
    ...baseCard,
    background: "#f1f1f1",
    border: "1px solid #ccc"
};

const detailBox = {
    marginTop: 10,
    padding: 10,
    background: "#fff",
    borderRadius: 6,
    fontSize: 13
};

const tableWrapper = {
    marginTop: 20,
    overflowX: "auto"
};

const table = {
    width: "100%",
    borderCollapse: "collapse"
};