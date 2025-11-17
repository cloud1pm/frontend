import axiosInstance from "./axiosInstance";
import { USE_MOCK_API, mockResponse } from "./config";

const MOCK_TOTAL_PAGES = 5;

const mockPosts = [
  {
    id: 1,
    nickname: "minji101",
    title: "기분이 꿀꿀할 때 나만의 루틴",
    content: "기분 나쁠 때 나만의 루틴을 소개해줄게!",
    likes: 12,
    comments: 7,
    date: "11월 7일 오전 10:30",
  },
  {
    id: 2,
    nickname: "soyo02",
    title: "첫 명상 후기 공유해요",
    content: "오늘 처음으로 추천받은 명상 해봤어요~! 명상 추천드립니다",
    likes: 9,
    comments: 4,
    date: "11월 7일 오후 02:10",
  },
  {
    id: 3,
    nickname: "snowdrop",
    title: "캐릭터 성장 어디까지 하셨나요?",
    content: "다들 캐릭터 어디까지 키우셨나요? 너무 귀여워요!",
    likes: 18,
    comments: 12,
    date: "11월 6일 오후 06:42",
  },
  {
    id: 4,
    nickname: "healinglog",
    title: "위기 감지 시 힐링 플레이리스트",
    content: "위험도 7일 때 꺼내보는 나만의 힐링 플레이리스트 공유해요.",
    likes: 5,
    comments: 2,
    date: "11월 5일 오후 08:05",
  },
  {
    id: 5,
    nickname: "wink",
    title: "위기 감지 후 챗봇 추천 후기",
    content: "위기 감지 지표가 올라서 당황했는데, 챗봇이 추천해준 심호흡 덕분에 진정했어요.",
    likes: 14,
    comments: 6,
    date: "11월 5일 오후 09:10",
  },
];

const withMockMeta = (items) =>
  mockResponse({
    items,
    totalPages: MOCK_TOTAL_PAGES,
  });

export const communityAPI = {
  async getPosts({ page = 1, tab = "home" } = {}) {
    if (USE_MOCK_API) {
      const randomized = mockPosts.map((post) => ({
        ...post,
        id: post.id + (page - 1) * mockPosts.length,
      }));
      return withMockMeta(randomized);
    }

    const { data } = await axiosInstance.get("/community/posts", {
      params: { page, tab },
    });
    return data;
  },

  async getPostById(id) {
    if (USE_MOCK_API) {
      const numericId = Number(id);
      const baseId = ((numericId - 1) % mockPosts.length) + 1;
      const base =
        mockPosts.find((post) => post.id === baseId) ??
        mockPosts[0];

      return mockResponse({
        ...base,
        id: numericId,
        fullContent:
          "기분이 안 좋을 때는 따뜻한 차를 마시면서 음악을 듣는 게 제일 좋더라구요. 여러분은 어떤 루틴이 있나요?",
      });
    }

    const { data } = await axiosInstance.get(`/api/community/posts/${id}`);
    return data;
  },

  async createPost(post) {
    if (USE_MOCK_API) {
      console.log("📩 [MOCK] 새 게시글 등록", post);
      return mockResponse({
        success: true,
        message: "게시글이 등록되었습니다.",
        postId: Date.now(),
      });
    }

    const formData = new FormData();
    formData.append("title", post.title);
    formData.append("emotion", post.emotion);
    formData.append("content", post.content);
    if (post.image) {
      formData.append("image", post.image);
    }

    const { data } = await axiosInstance.post("/api/community/posts", formData);
    return data;
  },

  async likePost(postId) {
    if (USE_MOCK_API) {
      return mockResponse({
        success: true,
        likes: Math.floor(Math.random() * 50) + 1,
      });
    }

    const { data } = await axiosInstance.post(`/api/community/posts/${postId}/like`);
    return data;
  },

  async addComment(postId, comment) {
    if (USE_MOCK_API) {
      return mockResponse({
        success: true,
        comment: {
          id: Date.now(),
          content: comment,
          author: "user123",
          date: "방금 전",
        },
      });
    }

    const { data } = await axiosInstance.post(
      `/api/community/posts/${postId}/comments`,
      { content: comment }
    );
    return data;
  },
};

