import { PostDto, searchPosts } from '@/services/posts';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const SearchScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<PostDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [visibleCount, setVisibleCount] = useState(10); 

  const performSearch = useCallback(async (keyword: string) => {
    if (!keyword.trim()) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      const response = await searchPosts(keyword.trim());
      if (response.IsSuccess && response.Data) {
        setResults(response.Data);
        setVisibleCount(10); 
      } else {
        setResults([]);
      }
    } catch (err: any) {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, performSearch]);

  const renderDescription = (text: string, id: number) => {
    const limit = 100;
    if (text.length <= limit) return <Text style={styles.resultContent}>{text}</Text>;

    return (
      <Text style={styles.resultContent}>
        {text.substring(0, limit)}...{' '}
        <Text 
          style={styles.readMore} 
          onPress={() => router.push({ pathname: '/post-detail', params: { id } })}
        >
          Read More
        </Text>
      </Text>
    );
  };

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 10);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Feather name="arrow-left" size={28} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Archive Search</Text>
        </View>

        <View style={styles.searchBarContainer}>
          <Feather name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            placeholder="Search messages, media, docs..."
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#F5B400" />
          </View>
        ) : (
          <ScrollView style={styles.resultsScrollView}>
            {results.slice(0, visibleCount).map((item) => (
              <TouchableOpacity
                key={item.Id.toString()}
                style={styles.resultCard}
                onPress={() => router.push({ pathname: '/post-detail', params: { id: item.Id } })}>
                
                {/* Left Side: Image */}
                <View style={styles.imageContainer}>
                  {item.ImageUrl ? (
                    <Image source={{ uri: item.ImageUrl }} style={styles.postImage} />
                  ) : (
                    <View style={styles.placeholderImage}>
                      <Feather name="image" size={20} color="#ccc" />
                    </View>
                  )}
                </View>

                {/* Right Side: Content */}
                <View style={styles.textContainer}>
                  <Text style={styles.resultUser}>{item.Name}</Text>
                  {renderDescription(item.Description, item.Id)}
                  <View style={styles.footerRow}>
                    <Text style={styles.resultDate}>By: {item.UserName}</Text>
                    {item.Url ? <Feather name="link" size={12} color="#F5B400" /> : null}
                  </View>
                </View>
              </TouchableOpacity>
            ))}

            {/* Load More Button */}
            {results.length > visibleCount && (
              <TouchableOpacity style={styles.loadMoreButton} onPress={handleLoadMore}>
                <Text style={styles.loadMoreText}>Load More</Text>
                <Feather name="chevron-down" size={16} color="#666" />
              </TouchableOpacity>
            )}

            {results.length === 0 && searchQuery !== '' && (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No results found</Text>
              </View>
            )}
            <View style={{ height: 100 }} /> 
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F4F4F4' },
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 10, backgroundColor: '#FFC109' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', marginLeft: 15, color: '#000' },
  searchBarContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderRadius: 10, marginHorizontal: 15, paddingHorizontal: 10, borderWidth: 1, borderColor: '#E0E0E0', marginTop: 10 },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, height: 45, fontSize: 14 },
  resultsScrollView: { flex: 1, marginTop: 10 },
  resultCard: { 
    flexDirection: 'row', 
    padding: 12, 
    borderBottomWidth: 1, 
    borderBottomColor: '#E0D3AA', 
    backgroundColor: 'white' 
  },
  imageContainer: { marginRight: 12 },
  postImage: { width: 60, height: 60, borderRadius: 8, backgroundColor: '#eee' },
  placeholderImage: { width: 60, height: 60, borderRadius: 8, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' },
  textContainer: { flex: 1, justifyContent: 'center' },
  resultUser: { fontWeight: 'bold', fontSize: 15, color: '#000', marginBottom: 2 },
  resultContent: { fontSize: 13, color: '#444', lineHeight: 18 },
  readMore: { color: '#F5B400', fontWeight: 'bold' },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 5 },
  resultDate: { fontSize: 11, color: '#888' },
  loadMoreButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: 15, 
    backgroundColor: '#fff',
    marginTop: 10 
  },
  loadMoreText: { color: '#666', fontWeight: 'bold', marginRight: 5 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { padding: 20, alignItems: 'center' },
  emptyText: { color: '#666' },
});

export default SearchScreen;