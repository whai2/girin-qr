import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { useProductState } from '../hooks/useProductState';
import { ALL_SIZES } from '../hooks/useProductState';
import { fetchStores, createStore, deleteStore, type Store } from '../api/products';
import { fetchCategories, createCategory, updateCategory, deleteCategory, type Category } from '../api/categories';

const TABS = ['전체리스트', '판매리스트', 'QR코드'];

export default function Admin() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated, loading: authLoading, permissions, role, logout } = useAuth();

  // 서버에서 스토어 목록 조회
  const { data: stores = [] } = useQuery({
    queryKey: ['stores'],
    queryFn: fetchStores,
    enabled: isAuthenticated,
  });

  // 서버에서 카테고리 목록 조회
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    enabled: isAuthenticated,
  });

  // 카테고리 이름 맵 (order -> name)
  const categoryNameMap: Record<number, string> = {};
  categories.forEach((c) => { categoryNameMap[c.order] = c.name; });

  const [activeLocationIdx, setActiveLocationIdx] = useState<number | null>(null);
  const activeStore = activeLocationIdx !== null ? stores[activeLocationIdx] : null;

  // 팝업 등록 폼
  const [showStoreForm, setShowStoreForm] = useState(false);
  const [storeFormName, setStoreFormName] = useState('');
  const [storeFormSlug, setStoreFormSlug] = useState('');

  // 카테고리 등록 폼
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [categoryFormName, setCategoryFormName] = useState('');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editCategoryName, setEditCategoryName] = useState('');

  const createStoreMutation = useMutation({
    mutationFn: (data: { slug: string; name: string }) => createStore(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stores'] });
      setShowStoreForm(false);
      setStoreFormName('');
      setStoreFormSlug('');
    },
  });

  const deleteStoreMutation = useMutation({
    mutationFn: (id: string) => deleteStore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stores'] });
      setActiveLocationIdx(null);
    },
  });

  const handleDeleteStore = () => {
    if (!activeStore) return;
    if (!confirm(`"${activeStore.name}" 팝업을 삭제하시겠습니까?\n해당 팝업의 모든 데이터가 삭제됩니다.`)) return;
    deleteStoreMutation.mutate(activeStore._id);
  };

  const createCategoryMutation = useMutation({
    mutationFn: (data: { name: string; order?: number }) => createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setShowCategoryForm(false);
      setCategoryFormName('');
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name?: string; order?: number } }) => updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setEditingCategory(null);
      setEditCategoryName('');
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  const handleCreateStore = () => {
    if (!storeFormName.trim() || !storeFormSlug.trim()) return alert('이름과 슬러그를 입력하세요.');
    createStoreMutation.mutate({ slug: storeFormSlug.trim(), name: storeFormName.trim() });
  };

  const handleCreateCategory = () => {
    if (!categoryFormName.trim()) return alert('카테고리 이름을 입력하세요.');
    createCategoryMutation.mutate({
      name: categoryFormName.trim(),
    });
  };

  const handleUpdateCategory = () => {
    if (!editingCategory || !editCategoryName.trim()) return;
    updateCategoryMutation.mutate({
      id: editingCategory._id,
      data: { name: editCategoryName.trim() },
    });
  };

  const handleDeleteCategory = (cat: Category) => {
    if (!confirm(`"${cat.name}" 카테고리를 삭제하시겠습니까?`)) return;
    deleteCategoryMutation.mutate(cat._id);
  };

  const {
    products,
    toggleSizeSoldOut,
    getSoldOutSizesForProduct,
    toggleAgeGroup,
    addProduct,
    removeProduct,
  } = useProductState(activeStore?.slug ?? '');
  const [activeTab, setActiveTab] = useState(0);
  const [activeCategory, setActiveCategory] = useState(0);
  const [search, setSearch] = useState('');

  // 상품 등록 폼 상태
  const [showAddForm, setShowAddForm] = useState(false);
  const [formName, setFormName] = useState('');
  const [formNumber, setFormNumber] = useState(0);
  const [formCategory, setFormCategory] = useState(1);
  const [formPrice, setFormPrice] = useState(20000);
  const [formSmartStoreUrl, setFormSmartStoreUrl] = useState('');
  const [formImage, setFormImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/admin/login');
    }
  }, [authLoading, isAuthenticated, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setFormName('');
    setFormNumber(0);
    setFormCategory(1);
    setFormPrice(20000);
    setFormSmartStoreUrl('');
    setFormImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async () => {
    if (!formName.trim()) return alert('상품명을 입력하세요.');
    if (!formImage) return alert('이미지를 선택하세요.');

    setIsSubmitting(true);
    try {
      await addProduct({
        name: formName,
        number: formNumber,
        category: formCategory,
        price: formPrice,
        image: formImage,
        ...(formSmartStoreUrl.trim() ? { smartStoreUrl: formSmartStoreUrl.trim() } : {}),
      });
      resetForm();
      setShowAddForm(false);
    } catch {
      alert('등록에 실패했습니다.');
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`"${name}" 상품을 삭제하시겠습니까?`)) return;
    await removeProduct(id);
  };

  if (authLoading || !isAuthenticated) return null;

  const filtered = products
    .filter((p) => activeCategory === 0 || p.category === activeCategory)
    .filter((p) => !search || p.name.includes(search));

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="px-4 pt-6 pb-4">
        <div className="flex items-start justify-between">
          <img
            src="/wtl-admin-title.png"
            alt="WTL Manager"
            className="h-20 md:h-28"
          />
          <div className="flex flex-col items-end gap-2">
            <img
              src="/wtl-super-manager-door.png"
              alt="Super Manager"
              className="h-20 md:h-28"
            />
            <button
              onClick={handleLogout}
              className="text-xs text-gray-400 hover:text-black transition-colors"
            >
              로그아웃
            </button>
          </div>
        </div>
      </div>

      {/* Location Tabs */}
      <div className="flex gap-3 px-4 pb-4 overflow-x-auto">
        {stores.map((store: Store, i: number) => (
          <button
            key={store.slug}
            onClick={() => setActiveLocationIdx(i)}
            className={`px-8 py-3.5 text-lg font-bold rounded-xl border transition-colors whitespace-nowrap ${
              activeLocationIdx === i
                ? 'bg-[#ffdd71] text-black border-black'
                : 'bg-white text-black border-gray-300'
            }`}
          >
            {store.name}
          </button>
        ))}
        {role === 'super_manager' && (
          <button
            onClick={() => setShowStoreForm(!showStoreForm)}
            className="px-4 py-3.5 text-lg font-bold rounded-xl border border-dashed border-gray-400 text-gray-400 hover:border-black hover:text-black transition-colors"
          >
            +
          </button>
        )}
      </div>

      {/* 팝업 등록 폼 */}
      {showStoreForm && role === 'super_manager' && (
        <div className="mx-4 mb-4 p-4 border-2 border-[#ffdd71] rounded-xl bg-[#fffbea]">
          <h3 className="font-bold text-lg mb-3">새 팝업 등록</h3>
          <div className="flex gap-3 mb-3">
            <div className="flex-1">
              <label className="block text-sm font-bold mb-1">이름</label>
              <input
                type="text"
                value={storeFormName}
                onChange={(e) => setStoreFormName(e.target.value)}
                placeholder="예: 더현대 대구"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-bold mb-1">슬러그</label>
              <input
                type="text"
                value={storeFormSlug}
                onChange={(e) => setStoreFormSlug(e.target.value)}
                placeholder="예: the-hyundai-daegu"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black"
              />
            </div>
          </div>
          <button
            onClick={handleCreateStore}
            disabled={createStoreMutation.isPending}
            className="w-full py-3 bg-black text-white font-bold rounded-lg disabled:opacity-50"
          >
            {createStoreMutation.isPending ? '등록 중...' : '팝업 등록'}
          </button>
        </div>
      )}

      {!activeStore ? (
        <p className="text-center text-gray-300 text-xl font-bold py-40">
          팝업 선택 먼저
        </p>
      ) : (
      <>
      {/* Tabs */}
      <div className="flex gap-6 px-4 pb-3 border-b border-gray-200 items-center">
        {TABS.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(i)}
            className={`text-base font-bold pb-2 transition-colors ${
              activeTab === i
                ? 'text-black border-b-2 border-black'
                : 'text-gray-400'
            }`}
          >
            {tab}
          </button>
        ))}
        {role === 'super_manager' && activeStore && (
          <button
            onClick={handleDeleteStore}
            disabled={deleteStoreMutation.isPending}
            className="ml-auto text-sm text-red-500 font-bold pb-2 hover:text-red-700 transition-colors"
          >
            {deleteStoreMutation.isPending ? '삭제 중...' : '팝업 삭제'}
          </button>
        )}
      </div>

      {/* Search + 등록 버튼 */}
      <div className="px-4 py-3 flex gap-2">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="검색"
          className="flex-1 border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:border-black"
        />
        {activeTab === 0 && permissions.canDelete && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-5 py-3 bg-[#ffdd71] text-black font-bold rounded-lg whitespace-nowrap"
          >
            {showAddForm ? '닫기' : '+ 등록'}
          </button>
        )}
      </div>

      {/* 상품 등록 폼 */}
      {showAddForm && activeTab === 0 && (
        <div className="mx-4 mb-4 p-4 border-2 border-[#ffdd71] rounded-xl bg-[#fffbea]">
          <h3 className="font-bold text-lg mb-3">새 상품 등록</h3>

          {/* 이미지 업로드 */}
          <div className="mb-3">
            <label className="block text-sm font-bold mb-1">이미지</label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center cursor-pointer hover:border-black transition-colors overflow-hidden"
            >
              {imagePreview ? (
                <img src={imagePreview} alt="미리보기" className="w-full h-full object-cover" />
              ) : (
                <span className="text-gray-400 text-sm text-center">클릭하여<br />이미지 선택</span>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>

          {/* 상품명 */}
          <div className="mb-3">
            <label className="block text-sm font-bold mb-1">상품명</label>
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="예: 11번 기린"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black"
            />
          </div>

          {/* 번호 + 카테고리 */}
          <div className="flex gap-3 mb-3">
            <div className="flex-1">
              <label className="block text-sm font-bold mb-1">번호</label>
              <input
                type="number"
                value={formNumber}
                onChange={(e) => setFormNumber(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-bold mb-1">카테고리</label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black"
              >
                {categories.map((cat) => (
                  <option key={cat._id} value={cat.order}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 가격 */}
          <div className="mb-3">
            <label className="block text-sm font-bold mb-1">가격 (원)</label>
            <input
              type="number"
              value={formPrice}
              onChange={(e) => setFormPrice(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black"
            />
          </div>

          {/* 스마트스토어 URL */}
          <div className="mb-4">
            <label className="block text-sm font-bold mb-1">스마트스토어 URL</label>
            <input
              type="url"
              value={formSmartStoreUrl}
              onChange={(e) => setFormSmartStoreUrl(e.target.value)}
              placeholder="https://smartstore.naver.com/..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black"
            />
          </div>

          {/* 등록 버튼 */}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full py-3 bg-black text-white font-bold rounded-lg disabled:opacity-50"
          >
            {isSubmitting ? '등록 중...' : '상품 등록'}
          </button>
        </div>
      )}

      {/* Category Filter */}
      <div className="flex gap-3 px-4 pb-4 overflow-x-auto items-center">
        <button
          onClick={() => setActiveCategory(0)}
          className={`text-sm whitespace-nowrap transition-colors ${
            activeCategory === 0
              ? 'text-black font-bold'
              : 'text-gray-400'
          }`}
        >
          전체
        </button>
        {categories.map((cat) => (
          <span key={cat._id} className="flex items-center gap-0.5 shrink-0">
            <button
              onClick={() => setActiveCategory(cat.order)}
              onDoubleClick={() => {
                if (role === 'super_manager') {
                  setEditingCategory(cat);
                  setEditCategoryName(cat.name);
                }
              }}
              className={`text-sm whitespace-nowrap transition-colors ${
                activeCategory === cat.order
                  ? 'text-black font-bold'
                  : 'text-gray-400'
              }`}
            >
              {cat.name}
            </button>
            {role === 'super_manager' && (
              <button
                onClick={() => handleDeleteCategory(cat)}
                className="text-gray-300 hover:text-red-500 transition-colors text-xs leading-none"
              >
                ×
              </button>
            )}
          </span>
        ))}
        {role === 'super_manager' && (
          <button
            onClick={() => setShowCategoryForm(!showCategoryForm)}
            className="text-sm text-gray-400 hover:text-black transition-colors whitespace-nowrap"
          >
            +
          </button>
        )}
      </div>

      {/* 카테고리 등록 폼 */}
      {showCategoryForm && role === 'super_manager' && (
        <div className="mx-4 mb-4 p-4 border-2 border-[#ffdd71] rounded-xl bg-[#fffbea]">
          <h3 className="font-bold text-lg mb-3">새 카테고리 등록</h3>
          <div className="mb-3">
            <label className="block text-sm font-bold mb-1">이름</label>
            <input
              type="text"
              value={categoryFormName}
              onChange={(e) => setCategoryFormName(e.target.value)}
              placeholder="예: 기린 시즌4"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black"
            />
          </div>
          <button
            onClick={handleCreateCategory}
            disabled={createCategoryMutation.isPending}
            className="w-full py-3 bg-black text-white font-bold rounded-lg disabled:opacity-50"
          >
            {createCategoryMutation.isPending ? '등록 중...' : '카테고리 등록'}
          </button>
        </div>
      )}

      {/* 카테고리 수정 모달 */}
      {editingCategory && role === 'super_manager' && (
        <div className="mx-4 mb-4 p-4 border-2 border-blue-300 rounded-xl bg-blue-50">
          <h3 className="font-bold text-lg mb-3">카테고리 수정</h3>
          <div className="mb-3">
            <label className="block text-sm font-bold mb-1">이름</label>
            <input
              type="text"
              value={editCategoryName}
              onChange={(e) => setEditCategoryName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleUpdateCategory}
              disabled={updateCategoryMutation.isPending}
              className="flex-1 py-3 bg-black text-white font-bold rounded-lg disabled:opacity-50"
            >
              {updateCategoryMutation.isPending ? '수정 중...' : '수정'}
            </button>
            <button
              onClick={() => handleDeleteCategory(editingCategory)}
              disabled={deleteCategoryMutation.isPending}
              className="px-5 py-3 bg-red-500 text-white font-bold rounded-lg disabled:opacity-50"
            >
              삭제
            </button>
            <button
              onClick={() => { setEditingCategory(null); setEditCategoryName(''); }}
              className="px-5 py-3 bg-gray-200 text-black font-bold rounded-lg"
            >
              취소
            </button>
          </div>
        </div>
      )}

      {/* Product List */}
      <div className="px-4 pb-8">
        {activeTab === 2 ? (
          <div className="text-center text-gray-400 py-20">
            QR코드 기능 준비중
          </div>
        ) : activeTab === 0 ? (
          /* 전체리스트 */
          <div className="space-y-3">
            {filtered.map((product) => {
              return (
                <div
                  key={product._id}
                  className="flex items-center gap-4 border border-black rounded-xl p-3"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-24 h-24 object-cover rounded-lg bg-gray-50"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-bold">{product.name}</p>
                    <p className="text-sm text-gray-400 mt-0.5">
                      {categoryNameMap[product.category] ?? '미분류'}
                    </p>
                    <div className="flex gap-2 mt-1">
                      {permissions.canDelete && (
                        <button
                          onClick={() => handleDelete(product._id, product.name)}
                          className="text-sm text-red-500"
                        >
                          삭제
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => permissions.canEdit && toggleAgeGroup(product._id, 'kids')}
                      disabled={!permissions.canEdit}
                      className={`w-16 h-16 rounded-full flex items-center justify-center text-xs font-bold border border-black transition-colors ${
                        product.ageGroup?.includes('kids')
                          ? 'bg-[#a7d8f0] text-black'
                          : 'bg-gray-300 text-gray-400'
                      } ${!permissions.canEdit ? 'cursor-not-allowed' : ''}`}
                    >
                      아동
                    </button>
                    <button
                      onClick={() => permissions.canEdit && toggleAgeGroup(product._id, 'adult')}
                      disabled={!permissions.canEdit}
                      className={`w-16 h-16 rounded-full flex items-center justify-center text-xs font-bold border border-black transition-colors ${
                        product.ageGroup?.includes('adult')
                          ? 'bg-[#ffdd71] text-black'
                          : 'bg-gray-300 text-gray-400'
                      } ${!permissions.canEdit ? 'cursor-not-allowed' : ''}`}
                    >
                      성인
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* 판매리스트 - 사이즈별 품절 관리 */
          <div className="space-y-4">
            {filtered.map((product) => {
              const soldOutSizes = getSoldOutSizesForProduct(product._id);
              return (
                <div
                  key={product._id}
                  className="border border-black rounded-xl p-4"
                >
                  <div className="flex gap-4 mb-3">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-24 h-24 object-cover rounded-lg bg-gray-50"
                    />
                    <div>
                      <p className="text-base font-bold">{product.name}</p>
                      <p className="text-sm text-gray-400">
                        {categoryNameMap[product.category] ?? '미분류'}
                      </p>
                    </div>
                  </div>
                  {/* Size Grid */}
                  <div className="grid grid-cols-5 gap-2">
                    {ALL_SIZES.map((size) => {
                      const isSizeSoldOut = soldOutSizes.includes(size);
                      return (
                        <button
                          key={size}
                          onClick={() => toggleSizeSoldOut(product._id, size)}
                          className={`py-2 rounded-lg text-sm font-bold border transition-colors ${
                            isSizeSoldOut
                              ? 'bg-red-500 text-white border-red-500'
                              : 'bg-white text-black border-gray-300'
                          }`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {filtered.length === 0 && activeTab !== 2 && (
          <p className="text-center text-gray-400 py-20">
            상품이 없습니다.
          </p>
        )}
      </div>
      </>
      )}
    </div>
  );
}
