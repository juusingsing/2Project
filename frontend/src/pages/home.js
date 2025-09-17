
import { Link } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import axios from "axios"

export default function Home() {
  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const [rows, setRows] = useState([]);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);

  // 데이터 불러오기
  const fetchData = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/users/user`);
      setRows(res?.data);
      console.log("rows", res?.data || []);
    } catch (err) {
      console.error("데이터 불러오기 실패", err);
    }
  };

  // 단건 조회 api 있을 때 
  const fetchDetail = async (id) => {
    try {
      const res = await axios.get(`${BASE_URL}/users/user/${id}`)
      setDetail(res?.data || null);
    } catch (err) {
      console.error("상세 불러오기 실패", err);
      setDetail(null);
    }
  };


  // 컴포넌트 로드시 불러오기
  useEffect(() => {
    fetchData();

    // 의존성없는거 경고무시하기
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 상세표시
  const selectedRow = useMemo(() => {
    if (!selectedId) return null;
    return rows.find((r) => r.id === selectedId) || null;
  }, [rows, selectedId]);

  // 행 클릭
  const handleSelect = (id) => {
    setSelectedId(id);
    fetchDetail(id);
  };


  // 데이터 추가
  const handleAdd = async () => {
    try {
      await axios.post(`${BASE_URL}/users/user`, {
        name,
        age: Number(age),
      });
      setName("");
      setAge("");
      fetchData(); // 다시 목록 갱신
    } catch (err) {
      console.error("데이터 추가 실패", err);
    }
  };

  const fmt = (v) => {
    try {
      const d = new Date(v);
      return isNaN(d.getTime()) ? String(v ?? "") : d.toLocaleString();
    } catch {
      return String(v ?? "");
    }
  };

  return (
    <>
      <div>
        <h1>메인</h1>
        <nav>
          <Link to="/1">Go to Page 1</Link> |{" "}
          <Link to="/2">Go to Page 2</Link>
        </nav>
      </div>

      <h1>wangnuna 테이블</h1>
      <div>
        {/* 테이블 */}
        <table border="1">
          <thead>
            <tr>
              <th>ID</th>
              <th>이름</th>
              <th>나이</th>
              <th>생성일</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}
                  onClick={() => handleSelect(r.id)}
              >
                <td>{r.id}</td>
                <td>{r.name}</td>
                <td>{r.age}</td>
                <td>{r.created_at}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ====== 오른쪽 상세 패널 ====== */}
        <aside>
          <h3>상세</h3>
          {selectedId == null ? (
            <p>왼쪽 목록에서 행을 선택하세요.</p>
          ) : (detail || selectedRow) ? (
            <div>
              <div>
                <strong>ID</strong>
                <div>{(detail || selectedRow).id}</div>
              </div>
              <div>
                <strong>이름</strong>
                <div>{(detail || selectedRow).name}</div>
              </div>
              <div>
                <strong>나이</strong>
                <div>{(detail || selectedRow).age}</div>
              </div>
              <div>
                <strong>생성일</strong>
                <div>{fmt((detail || selectedRow).created_at)}</div>
              </div>
            </div>
          ) : (
            <p>상세를 불러오는 중이거나, 데이터가 없습니다.</p>
          )}
        </aside>
      </div>

      <hr />

      <h2>새 데이터 추가</h2>
      <input
        type="text"
        placeholder="이름"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        type="number"
        placeholder="나이"
        value={age}
        onChange={(e) => setAge(e.target.value)}
      />
      <button onClick={handleAdd}>추가하기</button>

    </>

  );
}