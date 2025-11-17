import  axiosInstance from "../api/axiosInstance";
import { USE_MOCK_API, mockResponse } from "./config";

const POSTS_PER_PAGE = 6;

// ===== MOCK API 전용 함수들 =====
const initializeMockPosts = () => {
  const POSTS_KEY = "mockPosts";
  const existing = localStorage.getItem(POSTS_KEY);
  
  if (!existing) {
    const initialPosts = [
      {
        id: 1,
        nickname: "minji101",
        title: "기분이 꿀꿀할 때 나만의 루틴",
        content: "기분 나쁠 때 나만의 루틴을 소개해줄게!",
        likes: 12,
        likedBy: [],
        date: "11월 7일 오전 10:30",
      },
      {
        id: 2,
        nickname: "soyo02",
        title: "첫 명상 후기 공유해요",
        content: "오늘 처음으로 추천받은 명상 해봤어요~! 명상 추천드립니다",
        likes: 9,
        likedBy: [],
        date: "11월 7일 오후 02:10",
      },
      {
        id: 3,
        nickname: "snowdrop",
        title: "캐릭터 성장 어디까지 하셨나요?",
        content: "다들 캐릭터 어디까지 키우셨나요? 너무 귀여워요!",
        likes: 18,
        likedBy: [],
        date: "11월 6일 오후 06:42",
      },
      {
        id: 4,
        nickname: "healinglog",
        title: "위기 감지 시 힐링 플레이리스트",
        content: "위험도 7일 때 꺼내보는 나만의 힐링 플레이리스트 공유해요.",
        likes: 5,
        likedBy: [],
        date: "11월 5일 오후 08:05",
      },
      {
        id: 5,
        nickname: "wink",
        title: "위기 감지 후 챗봇 추천 후기",
        content: "위기 감지 지표가 올라서 당황했는데, 챗봇이 추천해준 심호흡 덕분에 진정했어요.",
        likes: 14,
        likedBy: [],
        date: "11월 5일 오후 09:10",
      },
    ];
    localStorage.setItem(POSTS_KEY, JSON.stringify(initialPosts));
  }
};

const getMockPosts = () => {
  const POSTS_KEY = "mockPosts";
  return JSON.parse(localStorage.getItem(POSTS_KEY) || "[]");
};

const saveMockPosts = (posts) => {
  const POSTS_KEY = "mockPosts";
  localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
};

// ===== 백엔드 응답 변환 함수 =====
const formatBackendPost = (backendPost) => ({
  id: backendPost.id,
  title: backendPost.title,
  content: backendPost.content,
  nickname: backendPost.authorName,
  profileImageUrl: backendPost.authorProfileImage,
  likes: backendPost.likeCount || 0,
  comments: backendPost.commentCount || 0,
  isLiked: backendPost.isLiked || false,
  date: new Date(backendPost.createdAt).toLocaleString('ko-KR', {
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }),
  createdAt: backendPost.createdAt,
});

const formatBackendComment = (backendComment) => ({
  id: backendComment.commentId,
  content: backendComment.content,
  author: backendComment.authorName,
  userId: backendComment.userId,
  timestamp: new Date(backendComment.createdAt).getTime(),
  date: new Date(backendComment.createdAt).toLocaleString('ko-KR', {
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }),
});

// ===== API 함수들 =====
export const communityAPI = {
  async getPosts({ page = 1, tab = "popular" } = {}) {
    if (USE_MOCK_API) {
      initializeMockPosts();
      const session = JSON.parse(localStorage.getItem("mockAuthToken") || "{}");
      let allPosts = getMockPosts();
      
      allPosts = allPosts.map((post) => {
        const commentsKey = `mockComments_${post.id}`;
        const comments = JSON.parse(localStorage.getItem(commentsKey) || "[]");
        return {
          ...post,
          comments: comments.length,
        };
      });

      if (tab === "popular") {
        allPosts.sort((a, b) => b.likes - a.likes);
      } else if (tab === "recent") {
        allPosts.sort((a, b) => b.id - a.id);
      } else if (tab === "my-posts") {
        const currentNickname = session.user?.nickname || "";
        allPosts = allPosts.filter((post) => post.nickname === currentNickname);
        allPosts.sort((a, b) => b.id - a.id);
      }

      const totalPosts = allPosts.length;
      const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);
      const startIndex = (page - 1) * POSTS_PER_PAGE;
      const endIndex = startIndex + POSTS_PER_PAGE;
      const paginatedPosts = allPosts.slice(startIndex, endIndex);

      return mockResponse({
        items: paginatedPosts,
        totalPages: Math.max(1, totalPages),
        currentPage: page,
        totalPosts: totalPosts,
      });
    }

    const { data } = await axiosInstance.get("/community/posts", {
      params: { page, tab },
    });
    return data;
  },

  async getPostById(id) {
    if (USE_MOCK_API) {
      initializeMockPosts();
      const allPosts = getMockPosts();
      const post = allPosts.find((p) => p.id === Number(id));
      
      if (!post) {
        return mockResponse(null);
      }

      const commentsKey = `mockComments_${id}`;
      const comments = JSON.parse(localStorage.getItem(commentsKey) || "[]");

      return mockResponse({
        ...post,
        comments: comments.length,
        fullContent: post.content,
      });
    }

    // 백엔드 API: GET /api/community/posts/{postId}
    const { data } = await axiosInstance.get(`/api/community/posts/${id}`);
    
    return formatBackendPost(data);
  },

  async createPost(post) {
    if (USE_MOCK_API) {
      initializeMockPosts();
      const session = JSON.parse(localStorage.getItem("mockAuthToken") || "{}");
      const allPosts = getMockPosts();
      
      const newPost = {
        id: Date.now(),
        nickname: session.user?.nickname || "익명",
        title: post.title,
        content: post.content,
        emotion: post.emotion,
        likes: 0,
        likedBy: [],
        date: new Date().toLocaleString('ko-KR', {
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
      };

      saveMockPosts([newPost, ...allPosts]);

      const CHARACTER_KEY = "mockCharacterInfo";
      const character = JSON.parse(localStorage.getItem(CHARACTER_KEY) || "{}");
      if (character.totalPoints !== undefined) {
        character.totalPoints += 1;
        localStorage.setItem(CHARACTER_KEY, JSON.stringify(character));
      }

      return mockResponse({
        success: true,
        message: "게시글이 등록되었습니다.",
        postId: newPost.id,
      });
    }

    // 백엔드 API: POST /api/community/posts
    // 요청: { title, content }
    const { data } = await axiosInstance.post("/api/community/posts", {
      title: post.title,
      content: post.content
    });

    return {
      success: true,
      message: "게시글이 등록되었습니다.",
      postId: data.id,
    };
  },

  async updatePost(postId, updatedPost) {
    if (USE_MOCK_API) {
      initializeMockPosts();
      const allPosts = getMockPosts();
      const postIndex = allPosts.findIndex((p) => p.id === Number(postId));
      
      if (postIndex === -1) {
        throw new Error("게시글을 찾을 수 없습니다.");
      }

      allPosts[postIndex] = {
        ...allPosts[postIndex],
        title: updatedPost.title,
        content: updatedPost.content,
        emotion: updatedPost.emotion,
      };

      saveMockPosts(allPosts);

      return mockResponse({
        success: true,
        message: "게시글이 수정되었습니다.",
      });
    }

    // 백엔드 API: PUT /api/community/posts/{postId}
    await axiosInstance.put(`/api/community/posts/${postId}`, {
      title: updatedPost.title,
      content: updatedPost.content
    });

    return {
      success: true,
      message: "게시글이 수정되었습니다.",
    };
  },

  async deletePost(postId) {
    if (USE_MOCK_API) {
      initializeMockPosts();
      const allPosts = getMockPosts();
      const filtered = allPosts.filter((p) => p.id !== Number(postId));
      saveMockPosts(filtered);

      const commentsKey = `mockComments_${postId}`;
      localStorage.removeItem(commentsKey);

      return mockResponse({
        success: true,
        message: "게시글이 삭제되었습니다.",
      });
    }

    // 백엔드 API: DELETE /api/community/posts/{postId}
    await axiosInstance.delete(`/api/community/posts/${postId}`);

    return {
      success: true,
      message: "게시글이 삭제되었습니다.",
    };
  },

  async likePost(postId) {
    if (USE_MOCK_API) {
      initializeMockPosts();
      const session = JSON.parse(localStorage.getItem("mockAuthToken") || "{}");
      const userId = session.user?.id || "guest";
      
      const allPosts = getMockPosts();
      const postIndex = allPosts.findIndex((p) => p.id === Number(postId));
      
      if (postIndex === -1) {
        throw new Error("게시글을 찾을 수 없습니다.");
      }

      const post = allPosts[postIndex];
      const likedBy = post.likedBy || [];
      const hasLiked = likedBy.includes(userId);

      if (hasLiked) {
        post.likedBy = likedBy.filter((id) => id !== userId);
        post.likes = Math.max(0, post.likes - 1);
      } else {
        post.likedBy = [...likedBy, userId];
        post.likes = post.likes + 1;

        const CHARACTER_KEY = "mockCharacterInfo";
        const character = JSON.parse(localStorage.getItem(CHARACTER_KEY) || "{}");
        if (character.totalPoints !== undefined) {
          character.totalPoints += 1;
          localStorage.setItem(CHARACTER_KEY, JSON.stringify(character));
        }
      }

      allPosts[postIndex] = post;
      saveMockPosts(allPosts);

      return mockResponse({
        success: true,
        likes: post.likes,
        isLiked: !hasLiked,
      });
    }

    // 백엔드 API: POST /api/community/posts/{postId}/like (토글)
    await axiosInstance.post(`/api/community/posts/${postId}/like`);

    // 좋아요 개수 다시 가져오기
    const { data: likeData } = await axiosInstance.get(`/api/community/posts/${postId}/likes/count`);
    const { data: postData } = await axiosInstance.get(`/api/community/posts/${postId}`);

    return {
      success: true,
      likes: likeData.likeCount,
      isLiked: postData.isLiked,
    };
  },

  async checkLikeStatus(postId) {
    if (USE_MOCK_API) {
      initializeMockPosts();
      const session = JSON.parse(localStorage.getItem("mockAuthToken") || "{}");
      const userId = session.user?.id || "guest";
      
      const allPosts = getMockPosts();
      const post = allPosts.find((p) => p.id === Number(postId));
      
      if (!post) {
        return mockResponse({ isLiked: false });
      }

      const likedBy = post.likedBy || [];
      return mockResponse({ isLiked: likedBy.includes(userId) });
    }

    // 백엔드: getPostById에서 isLiked 정보 포함
    const { data } = await axiosInstance.get(`/api/community/posts/${postId}`);
    return { isLiked: data.isLiked || false };
  },

  async getComments(postId) {
    if (USE_MOCK_API) {
      const commentsKey = `mockComments_${postId}`;
      const comments = JSON.parse(localStorage.getItem(commentsKey) || "[]");
      return mockResponse(comments);
    }

    // 백엔드: getPostById 응답에 comments 배열 포함
    const { data } = await axiosInstance.get(`/api/community/posts/${postId}`);
    return (data.comments || []).map(formatBackendComment);
  },

  async addComment(postId, comment) {
    if (USE_MOCK_API) {
      const session = JSON.parse(localStorage.getItem("mockAuthToken") || "{}");
      const timestamp = Date.now();
      const newComment = {
        id: timestamp,
        content: comment,
        author: session.user?.nickname || "user123",
        userId: session.user?.id || "guest",
        timestamp: timestamp,
        date: "방금 전",
      };

      const commentsKey = `mockComments_${postId}`;
      const existingComments = JSON.parse(localStorage.getItem(commentsKey) || "[]");
      localStorage.setItem(commentsKey, JSON.stringify([...existingComments, newComment]));

      const CHARACTER_KEY = "mockCharacterInfo";
      const character = JSON.parse(localStorage.getItem(CHARACTER_KEY) || "{}");
      if (character.totalPoints !== undefined) {
        character.totalPoints += 1;
        localStorage.setItem(CHARACTER_KEY, JSON.stringify(character));
      }

      return mockResponse({
        success: true,
        comment: newComment,
      });
    }

    // 백엔드 API: POST /api/community/posts/{postId}/comments
    const { data } = await axiosInstance.post(`/api/community/posts/${postId}/comments`, {
      content: comment
    });

    return {
      success: true,
      comment: formatBackendComment(data),
    };
  },

  async deleteComment(postId, commentId) {
    if (USE_MOCK_API) {
      const commentsKey = `mockComments_${postId}`;
      const comments = JSON.parse(localStorage.getItem(commentsKey) || "[]");
      const filtered = comments.filter(c => c.id !== commentId);
      localStorage.setItem(commentsKey, JSON.stringify(filtered));

      return mockResponse({ success: true });
    }

    // 백엔드 API: DELETE /api/community/comments/{commentId}
    // postId 불필요 (백엔드가 commentId만으로 삭제)
    await axiosInstance.delete(`/api/community/comments/${commentId}`);

    return { success: true };
  },
};