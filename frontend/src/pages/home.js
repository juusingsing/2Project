
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios"

export default function Home() {
  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const [rows, setRows] = useState([]);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");

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

  // 컴포넌트 로드시 불러오기
  useEffect(() => {
    fetchData();

    // 의존성없는거 경고무시하기
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>{r.name}</td>
              <td>{r.age}</td>
              <td>{r.created_at}</td>
            </tr>
          ))}
        </tbody>
      </table>


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